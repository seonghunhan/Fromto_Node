const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const { nextTick } = require("process");
const { smtpTransport } = require("../../../config/email")

const { pool } = require("../../../config/database");
const userDao = require("./userDao");
const { type } = require("os");
/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
 exports.getTest = async function (req, res) {


    //const userIdx = req.verifiedToken.userIdx;



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
 * API No. 2.5
 * API Name : 계정 삭제 API
 * [GET] /app/users/deleteUsers
 */
 exports.deleteAccount = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const deleteResult = await userProvider.deleteAccountByIdx(userIdx);

    if(deleteResult){
        return res.send(response(baseResponse.SUCCESS))
    }

 }

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
 * [POST] /app/users/passwordAuthcodeCheck
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
 * [POST] /app/newusers/changePassword
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
    const userIdxResult = req.verifiedToken.userIdx;
    console.log(userIdResult, userIdxResult);
    
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};


/**
 * API No. 12
 * API Name :  MyPageUI API(닉네임, 프로필url 불러오기)
 * [GET] /app/login/mypage/userInfo
 */
exports.getMypageInfo = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;

    // console.log(userIdxResult)

    const userNickname = await userProvider.retrieveMypage(userIdxResult)

    //console.log(userNickname[0])
    return res.send(response(baseResponse.SUCCESS, {'nickname': userNickname[0], 'profileImgUrl': userNickname[1]}));

}

/**
 * API No. 13
 * API Name :  MyPageUI API(닉네임, 프로필url 불러오기)
 * [GET] /app/login/mypage/writtenPosterurl
 */
 exports.getMypageProfileurl = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;

    const selectPosterurlResult = await userProvider.retrievePosterurlForMypage(userIdxResult)

    return res.send(response(baseResponse.SUCCESS, {'가장먼저쓴포스터3개': selectPosterurlResult}))

}


/**
 * API No. 14
 * API Name :  프로필사진 변경 API
 * [POST] /app/login/mypage/changeProfileImgUrl
 */
exports.changeProfileUrl = async function (req, res) {
    const userIdxResult = req.verifiedToken.userIdx;
    const {ImgUrl} = req.body

    //console.log(userIdxResult)
    const changeprofileUrl = await userService.editProfileImgUrl(userIdxResult, ImgUrl)

    return res.send(changeprofileUrl)

}

/**
 * API No. 15
 * API Name : 셋팅 API
 * [GET] /app/login/mypage/settings
 */


exports.settings = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const settingsResult = await userProvider.retrieveSettings(userIdx)

    const userId = settingsResult.id
    const Alarm = Boolean(settingsResult.alarm)

    return res.send(response(baseResponse.SUCCESS, {'Id': userId, 'Alarm': Alarm}));

}

/**
 * API No. 16
 * API Name : 셋팅 알람설정 API
 * [POST] /app/login/mypage/settings/alarmActive
 */


 exports.alarm = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const {alarm} = req.body;

    const boolalarm = Boolean(alarm)


    const AlarmActiveResult = await userService.editAlarmActive(userIdx, boolalarm)

    return res.send(AlarmActiveResult)
}


/**
 * API No. 17
 * API Name : 편지 작성 API (닉네임제공)
 * [GET] /app/login/writingeLetter
 */


 exports.getUserNickname = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const selectResult = await userProvider.retrieveUserNickname(userIdx)

    return res.send(response(baseResponse.SUCCESS, {'nickname': selectResult}));

}

/**
 * API No. 18
 * API Name : 편지 보내기 API (DB저장)
 * [POST] /app/login/sendingLetter
 */


 exports.postWritedLetter = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const {letterTitle, movieTitle, contents, posterurl, preferAge, preferGender, spoStatus} = req.body;

    const boolSpoStatus = Boolean(spoStatus)

    const createLetterResult = await userService.createWritingLetter(userIdx, letterTitle, movieTitle, contents, posterurl, preferAge, preferGender, boolSpoStatus)

    return res.send(createLetterResult)
}

/**
 * API No. 19
 * API Name : 안읽은 편지 유무 API
 * [GET] /app/login/sendingLetter
 */

 exports.getischeckLetter = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const checkLetterResult = await userProvider.retrieveIscheckedLetter(userIdx)

    return res.send(checkLetterResult)
}

/**
 * API No. 20
 * API Name : 안읽은 편지 클릭 API
 * [GET] /app/login/readingLetter
 */

 exports.getLetterInfo = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const resultResponse = await userService.editLetterInfo(userIdx)

    return res.send(resultResponse)
}

/**
 * API No. 20.5
 * API Name : 랜덤 재전송 API
 * [GET] /app/login/readingLetter/resending
 */

 exports.resendingLetter = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const resultResponse = await userService.resendingLetter(userIdx)

    return res.send(resultResponse)
}

/**
 * API No. 20.6
 * API Name :  랜덤 data 삭제 API
 * [GET] /app/login/readingLetter/deletePreferData
 */
 exports.deletePreferData = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const resultResponse = await userProvider.senderIdxCheckForDelete(userIdx)

    if(resultResponse){
        return res.send(response(baseResponse.SUCCESS));
    }
}

/**
 * API No. 21
 * API Name : 편지 회신 API
 * [POST] /app/login/readingLetter/replyToLetter
 */


 exports.postReplyInfo = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const {replyContents} = req.body;

    const ResultResponse = await userService.createReplyLetter(userIdx, replyContents)

    return res.send(ResultResponse);
}

/**
 * API No. 22
 * API Name : 내가 쓴 영화 API (22번UI) 
 * [GET] /app/login/mypage/readingMyMovie
 */

 exports.getMovieLetterList = async function (req, res) {

    const userIdx = req.verifiedToken.userIdx;

    const resultResponse = await userProvider.retrieveMovieLetterList(userIdx)

    return res.send(response(baseResponse.SUCCESS, {'result': resultResponse}))
}



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

