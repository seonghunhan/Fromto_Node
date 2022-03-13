const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const AWS = require('aws-sdk') //AWS에서 제공하는 Node.js JavaScript용 AWS SDK
const fs = require('fs'); //filesystem모듈 파일 읽고 쓰고 보내고하는데 사용
const secret_config = require("../../../config/secret");
const multer = require('multer'); //파일 업로드의 위치를 s3의 버킷으로 보냄
var storage = multer.memoryStorage()
var upload = multer({storage: storage});



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

exports.editProfileImgUrl = async function (userIdx, bucket_name, key, body){

    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const s3 = new AWS.S3({
            accessKeyId: secret_config.s3AccessKey , // 사용자의 AccessKey
            secretAccessKey: secret_config.s3SevretAccessKey ,// 사용자의 secretAccessKey
            region: secret_config.s3region,  // 사용자 사용 지역 (서울의 경우 ap-northeast-2)
        });

        const selectUserIdxforUpdate = await userDao.selectUserIdx(connection, userIdx);

        const params1 = {
            Bucket: bucket_name,
            Key: key, // file name that you want to save in s3 bucket
            Body: body
        }

        const params2 = {
            Bucket: bucket_name,
            Key: key, // file name that you want to save in s3 bucket
        }
    
        if (selectUserIdxforUpdate.length < 1){
            //이미지 업로드
            s3.upload(params1, (err, data) => {
                if (err) {
                    res.status(500).json({error:"Error -> " + err});
                }
                console.log({message: 'upload success! -> filename = ' + key})
            })
            //이미지 url 추출
            const url = s3.getSignedUrl('getObject', params2);
            const insertNewProfileImgUrl = await userDao.insertNewprofileImgUrl(connection, userIdx, key, url);
            return response(baseResponse.SUCCESS, {'imageUrl' : url});
        }else {
            const selectKeyFilename = await userDao.selectOriginKeyFilename(connection, userIdx);
            const ParamsForDelete = {
                Bucket: bucket_name,
                Key: selectKeyFilename
            }
            // deleteObject와 upload함수가 비동기식으로 실행되기 때문에 promise,then을 사용하여 순차적으로 실행
            function deleteAndupload(){
                return new Promise(function(resolve, reject){
                    s3.deleteObject(ParamsForDelete, function(err, data){
                        if (err) {
                            res.status(500).json({error:"Error ->" + err})
                        }else {
                            console.log("S3에 기존 이미지가 있어서 삭제했습니다.")
                            resolve()
                        }})
                    
                }).then(function(result){
                    return new Promise(function(resolve, reject){
                        //console.log("여기까지는 왔어유")
                        // upload라는 비동기함수땜에 또 promise사용한것 then을 연속 두번사용하면 promise처럼 안해줌
                        s3.upload(params1, (err, data) => {
                            if (err) {
                                res.status(500).json({error:"Error -> " + err});
                            }
                            console.log({message: 'upload success! -> filename = ' + key})
                            resolve()
                        })
                    }).then(async function(result){
                        //새로 업로드된 이미지 URL 추출(이걸 밖에다가 넣으면 deleteAndupload()함수가 쓰레드처럼 동작하기에 순차적으로 넣으려면 여기다 넣어야함)
                        console.log("여기다!!!!")
                        const url = s3.getSignedUrl('getObject', params2);
                        console.log(userIdx, key, url)    
                        const connection = await pool.getConnection(async (conn) => conn);                 
                        const updateNewProfileImgUrl = await userDao.updateprofileImgUrl(connection, url, key, userIdx);
                        return response(baseResponse.SUCCESS, {'imageUrl' : url});
                    }).catch(function(err) {
                        console.log('마지막에 catch붙이는게 깔끔', err);
                    });
                })
            }

            return deleteAndupload()

            //return response(baseResponse.SUCCESS, {'imageUrl' : url});


        }
        connection.release();

    }catch (err) {
        logger.error(`App - editProfileImgUrl Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

// function deleteAndupload(){
//     return new Promise(function(resolve, reject){
//         s3.deleteObject(ParamsForDelete, function(err, data){
//             if (err) {
//                 res.status(500).json({error:"Error ->" + err})
//             }else {
//                 console.log("S3에 기존 이미지가 있어서 삭제했습니다.")
//             }})
//     }).then(function(result){
//         s3.upload(params1, (err, data) => {
//             if (err) {
//                 res.status(500).json({error:"Error -> " + err});
//             }
//             console.log({message: 'upload success! -> filename = ' + req.file.originalname})
//         })
//     }).catch(function(err) {
//         console.log('마지막에 catch붙이는게 깔끔', err);
//     });
// }
// deleteAndupload()


// function test1(){
//     return new Promise(function(resolve, reject){
//         resolve(3)
//     }).then(function(result){
//         const ta = result + 1
//         console.log(ta)
//     }).catch(function(err) {
//         console.log('마지막에 catch붙이는게 깔끔', err);
//     });
// }
// test1()

            // //기존 이미지 삭제
            // s3.deleteObject(ParamsForDelete, function(err, data){
            //     if (err) {
            //         res.status(500).json({error:"Error ->" + err})
            //     }else {
            //         console.log("S3에 기존 이미지가 있어서 삭제했습니다.")
            //     }})
            // //이미지 새로 업로드
            // s3.upload(params1, (err, data) => {
            //     if (err) {
            //         res.status(500).json({error:"Error -> " + err});
            //     }
            //     console.log({message: 'upload success! -> filename = ' + req.file.originalname})
            // })



exports.editAlarmActive = async function (userIdx, alarm){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const updateAlarm= await userDao.updateAlarm(connection, userIdx, alarm);
    
        if (alarm == true && updateAlarm) {
            return response(baseResponse.SUCCESS, {'Alarm Status' : alarm});
        } else if (alarm == false && updateAlarm){
            return response(baseResponse.SUCCESS2, {'Alarm Status' : alarm});
        } else {
            return errResponse(baseResponse.DB_ERROR);
        }

        connection.release();

    }catch (err) {
        logger.error(`App - editAlarmActive Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editNickname = async function (userIdx, newNickname){

    try{
    const connection = await pool.getConnection(async (conn) => (conn));
    const selectCheckNicknameForChange = await userDao.selectUserNicknameForChange(connection, newNickname, userIdx)
    const originNickname = await userDao.selectUserNicknameByIdx(connection, userIdx)


    console.log(selectCheckNicknameForChange.length)

        // 기존에 다른유저가 사용중인 닉네임을 사용하려할 경우 발생
    if (selectCheckNicknameForChange.length > 0){
        return errResponse(baseResponse.SIGNUP_REDUNDANT_NICKNAME)
    } 

    // 위에와 같이 사용할경우 로직상 에러발생하여 밑에다가 사용
    const updateNicknameResult = await userDao.updateNickname(connection, userIdx, newNickname);
    const selectChanegedNicknameResult = await userDao.selectUserNicknameByIdx(connection, userIdx)


    // 바뀐값 탐지 파라메터와 에러발생 파라메터를 활용하여 닉네임변경 에러검출

    // 정상적으로 바꿀때
    // changedRows : 1 , warningStatus : 0

    // 바디 고장날때  -> 이때 닉네임은 공백으로 바뀐다
    // changedRows : 1 , warningStatus : 1 

    // 같은 닉네임으로 바꿀때
    // changedRows : 0 , warningStatus : 0
    if(updateNicknameResult[0] == 1 && updateNicknameResult[1] == 1){
        const reupdateNicknameResult = await userDao.updateNickname(connection, userIdx, originNickname);
        // 바디 오류일때 공백으로 바뀌기때문에 기존에 사용하던 닉네임으로 다시 바꿔줘야함
        return errResponse(baseResponse.SIGNIN_CHANGENICKNAME_ERROR)
    } else if(updateNicknameResult[0] == 1 && updateNicknameResult[1] == 0){
        return response(baseResponse.SUCCESS, {'newnickname': selectChanegedNicknameResult})
    } else if(updateNicknameResult[0] == 0 && updateNicknameResult[1] == 0) {
        return errResponse(baseResponse.SIGNIN_CHANGENICKNAME_SAMEERROR)
    }

    }catch (err) {
        logger.error(`App - editNickname Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.createWritingLetter = async function (userIdx, letterTitle, movieTitle, contents, posterurl, preferAge, preferGender, spoStatus){

    try{

        if (!letterTitle || !movieTitle || !contents) {
            return errResponse(baseResponse.SENDING_DATA_EMPTY);
        }else if (!posterurl){
            return errResponse(baseResponse.SENDING_POSTERDATA_EMPTY);
        }else{
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
            if (spoStatus == true){
            const savePrefer = await userDao.insertPrefer(connection, senderIdx, preferGender1, preferAge1)
            }
            const resultListByPrefer = new Array();
            // 필터가 0번(상관없음)일경우 4가지 경우의 수
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
        
            const poseterIdx = await userDao.insertPosterurl(connection, posterurl);;
            console.log("여기까지는 왔는데" + recipientIdx)
            const insertLetterInfoResult = await userDao.insertLetterInfo(connection, letterTitle, movieTitle, contents, senderIdx, recipientIdx, poseterIdx, spoStatus ); 
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
        // 가장 최근에 온 편지를 ischecked(0:안읽음)으로 선별
        const retriveFirstLetterInfo = await userDao.selectFirstLetterIdx(connection, userIdx)
        //console.log("여기"+retriveFirstLetterInfo)

        const letterIdx = retriveFirstLetterInfo.idx
        const posterIdx = retriveFirstLetterInfo.posterIdx
        // 위에서 ischecked가 0인거 읽었으니 true(1:읽음)으로 바꿔주기
        const updateIscheckedByFirstIdx = await userDao.updateLetterIschecked(connection,letterIdx)
        const retrievePosterurl = await userDao.selectposterurl(connection, posterIdx)
        const retriveFirstLetterInfoByIdx = await userDao.selectLetterInfo(connection,letterIdx)
        
        const posterurlValue = retrievePosterurl.movieImgUrlForLetter
        const senderIdx = retriveFirstLetterInfoByIdx.senderIdx
        const recipientIdx = retriveFirstLetterInfoByIdx.recipientIdx

        const SenderNickname = await userDao.selectUserNicknameByIdx(connection, senderIdx)
        const RecipientNickname = await userDao.selectUserNicknameByIdx(connection, recipientIdx)

        // 기존 객체에 새로운 객체 (key는 posterurl, value는 posterurlValue)
        retriveFirstLetterInfoByIdx.posterurl = posterurlValue  
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

exports.resendingLetter = async function (userIdx){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        // const retrieveMyInfoForRandomResending = await userDao.selectMyInfoByIdx(connection, userIdx)
        // const age = retrieveMyInfoForRandomResending.age
        // const gender = retrieveMyInfoForRandomResending.gender

        const retrieveLetterInfo = await userDao.selectLetterInfoByIschecked(connection, userIdx)
        const senderIdx = retrieveLetterInfo.senderIdx
        const letterTitle = retrieveLetterInfo.letterTitle
        const movieTitle = retrieveLetterInfo.movieTitle
        const contents = retrieveLetterInfo.contents
        const posterIdx = retrieveLetterInfo.posterIdx

        const retrievePosterurl = await userDao.selectposterurl(connection, posterIdx)
        const posterurl = retrievePosterurl.movieImgUrlForLetter

        const retrievePreferInfo = await userDao.selectPreferInfo(connection, senderIdx)
        const preferAge_ = retrievePreferInfo.preferAge
        const preferGender = retrievePreferInfo.preferGender
        const spoStatus = true



        const useridxlist = await userDao.selectUserIdxList(connection);
        const useridxlistLenth = useridxlist.length
    
        // userInfo 테이블에서 인덱스만 추출
        const resultList = new Array();  
        for (var i = 0; i < useridxlistLenth; i++){
            resultList.push(useridxlist[i].idx)
        }
        console.log("전체 idx : " + resultList)
        // 새로 추출한 리스트에서 자기와 보낸사람 Idx제거
        for (var i = 0; i < resultList.length; i++){ 
            if(resultList[i] == senderIdx || resultList[i] == userIdx){
                resultList.splice(i, 1);  // splice(삭제인덱스, 갯수)
                i--;
            }
        }
        console.log("자기 인덱스 제외한 idx : " + resultList)
        const preferGender1 = preferGender
        const preferAge1 = preferAge_
        const preferAge2 = parseInt(preferAge1) + 10
    
        const resultListByPrefer = new Array();
        // 필터가 0번(상관없음)일경우 4가지 경우의 수
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
    
        console.log("여기까지는 왔는데" + recipientIdx)
        const updateLetterInfoResult = await userDao.updateResendingLetter(connection, userIdx, recipientIdx); 
        return response(baseResponse.SUCCESS ,{'beforeRecipientIdx' : userIdx, 'afterRecipientIdx' : recipientIdx} );
        }



    catch (err) {
        logger.error(`App - resendingLetter Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.createReplyLetter = async function (userIdx, Contents){

    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const LetterListResult = await userDao.selectReplyLetterInfo(connection, userIdx)
    
        const letterTitle = LetterListResult[0][0].letterTitle
        const movieTitle = LetterListResult[0][0].movieTitle
        const recipientIdx = LetterListResult[0][0].senderIdx
        const posterIdx = LetterListResult[0][0].posterIdx
        const senderIdx = userIdx
        const senderNickname = await userDao.selectUserNicknameByIdx(connection, senderIdx)
        const recipientNickname = await userDao.selectUserNicknameByIdx(connection, recipientIdx)
    
        const retrievePosterurl = await userDao.selectposterurl(connection, posterIdx)
        const posterurl = retrievePosterurl.movieImgUrlForLetter
    
        console.log("테이블에 추가된 레코드 : " + letterTitle, movieTitle, Contents, recipientIdx, senderIdx, posterIdx)
    
        if (!Contents) {
            return errResponse(baseResponse.RESENDING_CONTENTS_NOT_EXIST);
        } else{
            const editReplyLetter = await userDao.insertLetterInfo(connection, letterTitle, movieTitle, Contents, senderIdx, recipientIdx, posterIdx) 
            return response(baseResponse.SUCCESS, {'SenderNickname' : senderNickname, 'recipientNickname' : recipientNickname} )
        }
        
        connection.release();
    
    


    }catch (err) {
        logger.error(`App - createReplyLetter Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
