const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (id, password, nickname, birth, gender) {
    try {
        // 이메일 중복 확인
        // UserProvider에서 해당 이메일과 같은 User 목록을 받아서 emailRows에 저장한 후, 배열의 길이를 검사한다.
        // -> 길이가 0 이상이면 이미 해당 이메일을 갖고 있는 User가 조회된다는 의미

        // const emailRows = await userProvider.emailCheck(email);
        // if (emailRows.length > 0)
        //     return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertUserInfoParams = [id, hashedPassword, nickname, birth, gender];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (id, password) {
    try {
        // 이메일 여부 확인
        const idRows = await userProvider.idCheck(id);
        if (idRows.length < 1) {
            return errResponse(baseResponse.SIGNIN_ID_WRONG);
        }
        const selectId = idRows[0].id

        // 비밀번호 확인 (입력한 비밀번호를 암호화한 것과 DB에 저장된 비밀번호가 일치하는 지 확인함)

        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectId, hashedPassword];

        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);
        //console.log(passwordRows.password)

        if (passwordRows.length < 1 ) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }
        

        // // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(id);

        // if (userInfoRows[0].status === "INACTIVE") {
        //     return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        // } else if (userInfoRows[0].status === "DELETED") {
        //     return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        // }

        console.log(userInfoRows[0].id) // DB의 userId
        console.log(userInfoRows[0].idx)

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].id,
                userIdx: userInfoRows[0].idx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'useridx': userInfoRows[0].idx, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (id, nickname) {
    try {
        console.log(id)
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, id, nickname)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


exports.generateRandom = async function (min, max) {

    let ranNum = Math.floor(Math.random()*(max-min+1)) + min;
    return ranNum;

}

exports.editPassword = async function (email, password) {

    try{
    const hashedPassword = await crypto
    .createHash("sha512")
    .update(password)
    .digest("hex");

    const connection = await pool.getConnection(async (conn) => conn);
    const editUserResult = await userDao.updatePassword(connection,email,hashedPassword)
    connection.release();

    return response(baseResponse.SUCCESS);

    }catch (err) {
        logger.error(`App - editPassword Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editProfileImgUrl = async function (userIdx, ImgUrl){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const selectUserIdxforUpdate = await userDao.selectUserIdx(connection, userIdx);
    
        if (selectUserIdxforUpdate.length < 1){
        const insertNewProfileImgUrl = await userDao.insertNewprofileImgUrl(connection, userIdx, ImgUrl);
        return response(baseResponse.SUCCESS, {'새로운 url을 등록했습니다.' : ImgUrl});
        } else {
        const updateUrl = await userDao.updateprofileImgUrl(connection, userIdx, ImgUrl);
        return response(baseResponse.SUCCESS, {'url을 수정했습니다.' : ImgUrl});
        }
        connection.release();

    }catch (err) {
        logger.error(`App - editProfileImgUrl Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editAlarmActive = async function (userIdx, alarm){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const updateAlarm= await userDao.updateAlarm(connection, userIdx, alarm);
    
        if (alarm == true && updateAlarm) {
            return response(baseResponse.SUCCESS, {'Alarm기능을 활성화 시켰습니다' : alarm});
        } else if (alarm == false && updateAlarm){
            return response(baseResponse.SUCCESS2, {'Alarm기능을 비활성화 시켰습니다' : alarm});
        } else {
            return errResponse(baseResponse.DB_ERROR);
        }

        // if (selectUserIdxforUpdate.length < 1){
        // const insertNewProfileImgUrl = await userDao.insertNewprofileImgUrl(connection, userIdx, ImgUrl);
        // return response(baseResponse.SUCCESS, {'새로운 url을 등록했습니다.' : ImgUrl});
        // } else {
        // const updateUrl = await userDao.updateprofileImgUrl(connection, userIdx, ImgUrl);
        // return response(baseResponse.SUCCESS, {'url을 수정했습니다.' : ImgUrl});
        // }
        // connection.release();

    }catch (err) {
        logger.error(`App - editAlarmActive Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}