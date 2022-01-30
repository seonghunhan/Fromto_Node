const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const { nextTick } = require("process");
const { smtpTransport } = require("../../../config/email")

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
 exports.getTest = async function (req, res) {
     return res.send(response(baseResponse.SUCCESS))
 }

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/newusers
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: id, password, nickname, birth, gender
     */
    const {id, password, nickname, birth, gender} = req.body;

    // 빈 값 체크
    if (!id || !password || !nickname || !birth || !gender) //id
        return res.send(response(baseResponse.SIGNUP_DATA_EMPTY));

    // // 길이 체크
    // if (email.length > 30)
    //     return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));
        
    // // 형식 체크 (by 정규표현식)
    // if (!regexEmail.test(email))
    //     return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // createUser 함수 실행을 통한 결과 값을 signUpResponse에 저장
    const signUpResponse = await userService.createUser(
        id,
        password,
        nickname,
        birth,
        gender
    );

    // signUpResponse 값을 json으로 전달
    return res.send(signUpResponse);
};

/**
 * API No. 2
 * API Name : 아이디 중복 체크 API
 * [GET] /app/users/idcheck/:id
 */
exports.checkInfoById = async function (req, res) {

    /**
     * Path Variable: id 
     */
    const id = req.params.id;

    const userListResult = await userProvider.CheckUserById(id);


    if (userListResult.length > 0) {
        return res.send(errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL));
    }else if(userListResult.length == 0){
    return res.send(response(baseResponse.SUCCESS));
    }
    
    // if (!email) {
    //     // 유저 전체 조회
    //     const userListResult = await userProvider.retrieveUserList();
    //     // SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" }, 메세지와 함께 userListResult 호출
    //     return res.send(response(baseResponse.SUCCESS, userListResult));
    // } else {
    //     // 아메일을 통한 유저 검색 조회
    //     const userListByEmail = await userProvider.retrieveUserList(email);
    //     return res.send(response(baseResponse.SUCCESS, userListByEmail));
    // }

};

/**
 * API No. 3
 * API Name : 닉네임 중복 체크 API
 * [GET] /app/users/nicknamecheck/:nickname
 */
 exports.checkInfoByNickname = async function (req, res) {

    /**
     * Path Variable: nickname 
     */
    const nickname = req.params.nickname;

    const userListResult = await userProvider.CheckUserByNickname(nickname);

    console.log(userListResult)

    if (userListResult.length > 0) {
        return res.send(errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME));
    }else if(userListResult.length == 0){
    return res.send(response(baseResponse.SUCCESS));
    }
    
    // if (!email) {
    //     // 유저 전체 조회
    //     const userListResult = await userProvider.retrieveUserList();
    //     // SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" }, 메세지와 함께 userListResult 호출
    //     return res.send(response(baseResponse.SUCCESS, userListResult));
    // } else {
    //     // 아메일을 통한 유저 검색 조회
    //     const userListByEmail = await userProvider.retrieveUserList(email);
    //     return res.send(response(baseResponse.SUCCESS, userListByEmail));
    // }

};


// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
 exports.login = async function (req, res) {

    const {id, password} = req.body;

 

    const signInResponse = await userService.postSignIn(id, password);

    return res.send(signInResponse);
};


/**
 * API No. 5
 * API Name :  이메일 인증 API
 * [POST] /app/newusers/authemail
 * body : email
 */
exports.authemail = async function (req, res) {

    const {email} = req.body;

    var ranNum = await userService.generateRandom(111111,999999)

    // var ranNum = Math.floor(Math.random()*(999999-111111+1)) + 111111;

    const mailOption = {
        from: '"FromTo" <fromto.dear.sincerely@gmail.com>',
        to: email ,
        subject: 'FromTo 인증번호',
        text: '오른쪽 인증번호를 입력해 주세요 : ' + ranNum
    };

    const authcodeResult = await userProvider.authcodeUpdate(ranNum, email)
    
    //checkCode(req, res, ranNum)

    //메일 전송
    const result = await smtpTransport.sendMail(mailOption, function(error){
        if (error) {
            console.log('에러 발생!!!' + error);
        }
        else {
            return res.send(response(baseResponse.SUCCESS));
        }
    });

}

/**
 * API No. 6
 * API Name :  인증코드 체크 API
 * [POST] /app/newusers/authcodeCheck
 * body : checkcode, email
 */
exports.checkCode = async function (req, res) {

        const {checkcode, email} = req.body;
        
        const realcode = await userProvider.authcodeCheck(email)

        

        //import {gogo} from "../../../config/email"

        //console.log(gogo)

 


        if (!checkcode){
            return res.send(response(baseResponse.SIGNUP_AUTHCODE_EMPTY));
        }else if (checkcode != realcode){
            return res.send(response(baseResponse.SIGNUP_AUTHCODE_WRONG));
        }else if (checkcode == realcode){
            return res.send(response(baseResponse.SUCCESS));
        }
}

/**
 * API No. 7
 * API Name :  회원가입 인증코드 삭제 API
 * [POST] /app/newusers/deleteAuthcode
 * body : email
 */
exports.deleteEmailAuthcode = async function (req, res) {

    const {email} = req.body

    const resultResponse = await userProvider.codeCheckForDelete(email)

    if(resultResponse){
        return res.send(response(baseResponse.SUCCESS));
    }
}

/**
 * API No. 8
 * API Name :  비밀번호 바꾸기 인증번호 API
 * [POST] /app/users/changePassword
 * body : birth, gender, id
 */
exports.changePasswordAuthcode = async function (req, res) {

        const {birth, gender, id} = req.body;
        
        const Userinfo = await userProvider.usercheckForChangePassword(birth, gender, id)

        if(!Userinfo){
            return res.send(response(baseResponse.SIGNIN_CHANGEPASSWORD_INFO_NOT_MATCHED))
        }else if (Userinfo){
            
            var ranNum = await userService.generateRandom(111111,999999)
        
            const mailOption = {
                from: '"FromTo" <fromto.dear.sincerely@gmail.com>',
                to: Userinfo.id ,
                subject: '비밀번호 변경',
                text: '임시비밀번호 : ' + ranNum
            };
            
            const authcodeResult = await userProvider.passwordAuthcodeUpdate(ranNum, id)

            //메일 전송
            const result = await smtpTransport.sendMail(mailOption, function(error){
                if (error) {
                    console.log('에러 발생!!!' + error);
                }
                else {
                    return res.send(response(baseResponse.SUCCESS));
                }
            });
        }
}

/**
 * API No. 9
 * API Name :  비밀번호 바꾸기 API
 * [POST] /app/newusers/passwordAuthcodeCheck
 * body : checkcode, email
 */
 exports.passwordcheckCode = async function (req, res) {

    const {birth, gender, checkcode, email, password1, password2} = req.body;
    
    const realcode = await userProvider.passwordAuthcodeCheck(email)


    if (!birth || !gender || !checkcode || !email || !password1 || !password2){
        return res.send(response(baseResponse.SIGNIN_CHANGEPASSWORD_DATA_EMPTY));
    }else if (checkcode != realcode){
        return res.send(response(baseResponse.SIGNIN_PASSWORDAUTHCODE_WRONG));
    }else if (password1 != password2){
        return res.send(response(baseResponse.SIGNIN_PASSWORD_NOT_MATCHED));
    }else if (checkcode == realcode && birth && gender && password1 && password2){
        await userService.editPassword(email, password2);
        return res.send(response(baseResponse.SUCCESS));
    }
}

/**
 * API No. 10
 * API Name :  비밀번호 인증코드 삭제 API
 * [POST] /app/newusers/deletePasswordAuthcode
 * body : email
 */
 exports.deletePasswordAuthcode = async function (req, res) {

    const {email} = req.body

    const resultResponse = await userProvider.passwordcodeCheckForDelete(email)

    if(resultResponse){
        return res.send(response(baseResponse.SUCCESS));
    }
}



/** JWT 토큰 검증 API
 *  * API No. 11
 * [GET] /app/auto-login
 */
 exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};


/** JWT 토큰 검증 API
 *  * API No. 11
 * [GET] /app/auto-login
 */
 exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

/** JWT 토큰 검증 API
 *  * API No. 11
 * [GET] /app/auto-login
 */
 exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};
















/**
 * API No. 6
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/:userNickName
 * path variable : userNickName
 * body : nickname
 */
exports.patchUsers = async function (req, res) {

    // jwt - userId, path variable :userNickName

    const userIdFromJWT = req.verifiedToken.userId
    const userIdxFromJWT = req.verifiedToken.userIdx
    const userId = req.params.userNickName;
    
    const nickname = req.body.userNickName;
    console.log(userIdFromJWT,userId, userIdxFromJWT)

    // JWT는 이 후 주차에 다룰 내용
    if (userIdFromJWT != userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickname) return res.send(response(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userId, nickname)
        return res.send(editUserInfo);
    }
};



// JWT 이 후 주차에 다룰 내용
/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};



 /**
 * API No. 11
 * API Name : 특정지역에 사는 유저 조회
 * [GET] /app/product
 */

// Query String: price

exports.getUserByRegion = async function(req,res){
    const region = req.query.region;
    const User = await userProvider.retrieveUserByRegion(region);
    console.log(region);

    // if (Array.isArray(pdinfoByprice) && pdinfoByprice.length ===0){
    //     return res.send(errResponse(baseResponse.PRODUCT_PRICE_EMPTY)); 
    // }else{
    //     return res.send(response(baseResponse.SUCCESS, pdinfoByprice));
    // }
    
    return res.send(response(baseResponse.SUCCESS, User));
};

