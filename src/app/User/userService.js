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
        
        // 주민번호를 이용하여 나이추출

        //const jumin1 = selectUserAgeResult.birth
        //const gender = selectUserAgeResult.gender
          
        const curDateObj = new Date(); // 날짜 Object 생성
        
        let tmpAge = 0; // 임시나이
        
        const curYear = curDateObj.getFullYear(); // 현재년도
        
        let curMonth = curDateObj.getMonth() + 1; // 현재월
        
        if(curMonth < 10) curMonth = "0" + curMonth; // 현재 월이 10보다 작을경우 '0' 문자 합한다
        
        let curDay = curDateObj.getDate(); // 현재일
        
        if(curDay < 10) curDay = "0" + curDay; // 현재 일이 10보다 작을경우 '0' 문자 합한다
        
        if(gender <= 2) {
            tmpAge = curYear - ( 1900 + parseInt(birth.substring(0, 2))) + 1 ;// 1, 2 일경우
                                    // paserInt 문자열을 파싱하여 정수형으로 반환
        } else {
            tmpAge = curYear - (2000 + parseInt(birth.substring(0, 2))) + 1 ;// 3, 4 일경우
        }    


        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertUserInfoParams = [id, hashedPassword, nickname, birth, gender, tmpAge];

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

        connection.release();

    }catch (err) {
        logger.error(`App - editAlarmActive Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.createWritingLetter = async function (userIdx, letterTitle, movieTitle, contents, posterurl, preferAge, preferGender){

    try{
        const senderIdx = userIdx

        const connection = await pool.getConnection(async (conn) => conn);

        const useridxlist = await userDao.selectUserIdxList(connection);
        const useridxlistLenth = useridxlist.length
    
        // userInfo 테이블에서 인덱스만 추출
        const resultList = new Array();  
        for (var i = 0; i < useridxlistLenth; i++){
            resultList.push(useridxlist[i].idx)
        }
        console.log("전체 idx : " + resultList)
        // 새로 추출한 리스트에서 자기 인덱스 제거
        for (var i = 0; i < resultList.length; i++){ 
            if(resultList[i] == senderIdx){
                resultList.splice(i, 1);  // splice(삭제인덱스, 갯수)
                i--;
            }
        }
        console.log("자기 인덱스 제외한 idx : " + resultList)
        const preferGender1 = preferGender
        const preferAge1 = preferAge
        const preferAge2 = parseInt(preferAge) + 10
    
        const resultListByPrefer = new Array();
        
        if(preferAge1 == 0 && preferGender1 == 0 ){
            console.log("1번작동")
            resultListByPrefer.push(resultList)
        }else if (preferGender1 == 0 ){
            const useridxlist2 = await userDao.selectUserIdxListByFilter2(connection, preferAge1, preferAge2 );
            console.log("2번작동")
            resultListByPrefer.push(useridxlist2)
        }else if (preferAge1 == 0){
            const useridxlist3 = await userDao.selectUserIdxListByFilter1(connection, preferGender1);
            console.log("3번작동")
            resultListByPrefer.push(useridxlist3)
        }else {
            const useridxlist4 = await userDao.selectUserIdxListByFilter3(connection, resultList, preferGender1, preferAge1, preferAge2);
            console.log("4번작동")
            resultListByPrefer.push(useridxlist4)
        }
    
        const result = resultListByPrefer[0]
    
        const FinalResultList = new Array();
        const FinalResultListLength = result.length
    
        for (var i = 0; i < FinalResultListLength; i++){
            FinalResultList.push(result[i].idx)
        }
    
        console.log("성별,나이 필터링한 idx : " + FinalResultList)
        
        if (FinalResultList < 1) {
            return errResponse(baseResponse.SENDING_RECIPIENT_NOT_EXIST);
        } else {
        //최종 수신자 뽑기
         //Math.random() => 0~1사이 부동소수점 난수발생
         //Math.floor : 소수점버리고 정수선언
        const newNum = Math.floor(Math.random() * FinalResultList.length); //무작위로 보내기 위하여 idx랜덤으로 한개추출               
        var recipientIdx = FinalResultList[newNum]
        console.log("랜덤으로 선택받은 최종 수신자 : " + recipientIdx)
        }
        if (!letterTitle || !movieTitle || !contents) {
            return errResponse(baseResponse.SENDING_DATA_EMPTY);
        }else if (!posterurl){
            return errResponse(baseResponse.SENDING_POSTERDATA_EMPTY);
        }else {
            const poseterIdx = await userDao.insertPosterurl(connection, posterurl);;
            console.log("여기까지는 왔는데" + recipientIdx)
            const insertLetterInfoResult = await userDao.insertLetterInfo(connection, letterTitle, movieTitle, contents, senderIdx, recipientIdx, poseterIdx ); 
            return response(baseResponse.SUCCESS);
        } 
        connection.release();

    }catch (err) {
        logger.error(`App - editWritingLetter Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editLetterInfo = async function (userIdx){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const retriveFirstLetterInfo = await userDao.selectFirstLetterIdx(connection, userIdx)

        const letterIdx = retriveFirstLetterInfo.idx
        const posterIdx = retriveFirstLetterInfo.posterIdx

        const updateIscheckedByFirstIdx = await userDao.updateLetterIschecked(connection,letterIdx)
        const retrievePosterurl = await userDao.selectposterurl(connection, posterIdx)
        const retriveFirstLetterInfoByIdx = await userDao.selectLetterInfo(connection,letterIdx)
        
        const posterurlValue = retrievePosterurl.movieImgUrlForLetter
        const senderIdx = retriveFirstLetterInfoByIdx.senderIdx
        const recipientIdx = retriveFirstLetterInfoByIdx.recipientIdx

        const SenderNickname = await userDao.selectUserNicknameByIdx(connection, senderIdx)
        const RecipientNickname = await userDao.selectUserNicknameByIdx(connection, recipientIdx)

        retriveFirstLetterInfoByIdx.posterurl = posterurlValue   // 기존 객체에 새로운 객체 (key는 posterurl, value는 posterurlValue)
        retriveFirstLetterInfoByIdx.senderNickname = SenderNickname
        retriveFirstLetterInfoByIdx.recipientNickname = RecipientNickname

        delete retriveFirstLetterInfoByIdx["senderIdx"];
        delete retriveFirstLetterInfoByIdx["recipientIdx"];	
        connection.release();

        return response(baseResponse.SUCCESS, (retriveFirstLetterInfoByIdx));

    }catch (err) {
        logger.error(`App - editLetterInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
