const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

// Provider: Read 비즈니스 로직 처리

exports.CheckUserById = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userResult = await userDao.selectUserId(connection, userId);
    //console.log(userId)
    connection.release();
    // console.log(userResult[0])
    // 만약 여기서 [0]으로하면 배열X 오브젝트로 반환되어 딕셔너리 관련함수 사용해줘야함
    return userResult; 
  };

exports.deleteAccountByIdx = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteResult = await userDao.deleteAccount(connection, userIdx);
  connection.release();
  console.log(deleteResult)
  return deleteResult
}

exports.CheckUserByNickname = async function (nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserNickname(connection, nickname);

  connection.release();
  // console.log(userResult[0])
  // 만약 여기서 [0]으로하면 배열X 오브젝트로 반환되어 딕셔너리 관련함수 사용해줘야함
  return userResult; 
};

exports.idCheck = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserId(connection, id);
  connection.release();

  return emailCheckResult;
};

exports.retrieveUserList = async function (email) {

  //email을 인자로 받는 경우와 받지 않는 경우를 구분하여 하나의 함수에서 두 가지 기능을 처리함

  if (!email) {
    // connection 은 db와의 연결을 도와줌
    const connection = await pool.getConnection(async (conn) => conn);
    // Dao 쿼리문의 결과를 호출
    const userListResult = await userDao.selectUser(connection);
    // connection 해제
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  // 쿼리문에 여러개의 인자를 전달할 때 selectUserPasswordParams와 같이 사용합니다.
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0]; // 한 명의 유저 정보만을 불러오므로 배열 타입을 리턴하는 게 아닌 0번 인덱스를 파싱해서 오브젝트 타입 리턴
  // 이거 딕셔너리로 변환됨(오브젝트 타입이라고 함) -> 딕셔너리 관련함수 정리한거 찾아보기 (아디중복체크할때 경험해봄)
};

exports.accountCheck = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, id);
  connection.release();

  return userAccountResult;
};

exports.authcodeCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCode = await userDao.selectAuthCode(connection,email);
  connection.release();
  const realcode = selectCode[0][0].emailcode;
  return realcode;
}

exports.codeCheckForDelete = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteCode = await userDao.deleteAuthCode(connection,email);
  connection.release();
  return deleteCode
}

exports.usercheckForChangePassword = async function(birth, gender, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const UserInfo = await userDao.selectUserInfoforPassword(connection, birth, gender, id);
  connection.release();
  return UserInfo;
}

exports.passwordAuthcodeCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCode = await userDao.passwordAuthcodeCheck(connection,email);
  connection.release();
  const realcode = selectCode[0][0].passwordcode;
  console.log(realcode)
  return realcode;
}

exports.passwordcodeCheckForDelete = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deleteCode = await userDao.deletePasswordAuthCode(connection,email);
  connection.release();
  return deleteCode
}

exports.retrieveMypage = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNickname = await userDao.selectUserMypage1(connection,userIdx);

  
  const selectImgUrl = await userDao.selectUserMypage2(connection,userIdx);

  if (selectImgUrl.length < 1) {
    return response(baseResponse.SUCCESS, {'nickname': selectNickname, 'profileImgUrl': "No Img"});
  } else {
      //selectImgUrl[0].profileImgUrl
      return response(baseResponse.SUCCESS, {'nickname': selectNickname, 'profileImgUrl': selectImgUrl[0].profileImgUrl});
  }
  connection.release();

  //return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'useridx': userInfoRows[0].idx});
  //selectMypageInfoRow[0].profileImgUrl
}

exports.retrievePosterurlForMypage = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectPosterurlResult = await userDao.selectUserMypage3(connection,userIdx);
  connection.release();

  const resultList = new Array();
  for (var i = 0; i < 3; i++){
    resultList.push(selectPosterurlResult[i].movieImgUrlForLetter)
  }
  
  return resultList
}

exports.retrieveSettings = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectSettingsInfo = await userDao.selectSettingsParmes(connection, userIdx)
  connection.release();
  return selectSettingsInfo
}

exports.retrieveUserNickname = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userNicknameResult = await userDao.selectUserNicknameByIdx(connection, userIdx)
  connection.release();
  return userNicknameResult
}

exports.retrieveIscheckedLetter = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ischeckedResult = await userDao.selectCountIscheckedLetter(connection, userIdx)
  connection.release();

  if (ischeckedResult > 0) {
    return response(baseResponse.SUCCESS, {'안읽은 편지의 개수' : ischeckedResult});
  } else if (ischeckedResult == 0){
    return response(baseResponse.SUCCESS2);
  }
}

exports.senderIdxCheckForDelete = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveSenderIdx = await userDao.selectLetterInfoByIschecked(connection, userIdx)

  const senderIdx = retrieveSenderIdx.senderIdx

  const deletePreferdata = await userDao.deletePreferData(connection, senderIdx)
  connection.release();
  return retrieveSenderIdx
}

exports.retrieveMovieLetterList = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const LetterListResult = await userDao.selectMovieLetterListByIdx(connection, userIdx)

  console.log(LetterListResult[0].posterIdx)
  console.log(LetterListResult.length)

  const posterIdxList = []
  
  //리스트에서 posterIdx만 추출해서 새list에 넣기
  for (var i = 0; i < LetterListResult.length; i++){  
    posterIdxList.push(LetterListResult[i].posterIdx)
  }

  // 리스트에서 중복 제거
  const newPosterIdxList = []
  posterIdxList.forEach((element) => {
    if (!newPosterIdxList.includes(element)){
      newPosterIdxList.push(element);
    }
  })

  // 취합한 posterIdx를 기준으로 제목,포스터url 2차원배열로 담기(1개 idx에 여러대화가 있으니 2차원으로 해야함)
  // fm으로 2차원배열만드는거는 밑에(233줄) 있고 222~226줄은 어쩌다보니 2차원배열로 생성된것
  const retrieveLetterListByPosterIdx = []
  for (var i = 0; i < newPosterIdxList.length; i++){
    var temp = await userDao.selectLetterListByPosterIdx(connection, newPosterIdxList[i])
    retrieveLetterListByPosterIdx.push(temp)
  }
  connection.release();

  return retrieveLetterListByPosterIdx

  //console.log(newArr)

  // const newArr = new Array(LetterListResult.length); //2차원 배열로 재배열
  // for (var i = 0; i < newArr.length; i++) {   
  //   newArr[i] = new Array(LetterListResult[i]);
  // }
}

exports.retrieveLetterList = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const LetterListResult = await userDao.selectLetterListByIdx(connection, userIdx)

  // console.log(LetterListResult)
  // console.log(LetterListResult.length)

  const posterIdxList = []
  
  //리스트에서 posterIdx만 추출해서 새list에 넣기
  for (var i = 0; i < LetterListResult.length; i++){  
    posterIdxList.push(LetterListResult[i].posterIdx)
  }

  // 리스트에서 중복 제거
  const newPosterIdxList = []
  posterIdxList.forEach((element) => {
    if (!newPosterIdxList.includes(element)){
      newPosterIdxList.push(element);
    }
  })

  // 취합한 posterIdx를 기준으로 제목,포스터url 2차원배열로 담기(1개 idx에 여러대화가 있으니 2차원으로 해야함)
  const retrieveLetterListByPosterIdx = []
  for (var i = 0; i < newPosterIdxList.length; i++){
    var temp = await userDao.selectLetterListByPosterIdxForLetterBox(connection, newPosterIdxList[i])
    retrieveLetterListByPosterIdx.push(temp)
  }
  connection.release();

  return retrieveLetterListByPosterIdx


}

// 31번 UI
// 아직 확인 안한거라면 새로운 편지인것 표시(ischecked사용)
// 그게 아니라면 
// 보낸사람, 받은사람, 날짜, 컨텐츠 표기


exports.retrieveChatList = async function (userIdx, posterIdx) {
  const connection = await pool.getConnection(async (conn) => conn );
  
  const retrieveChatListResult = await userDao.selectchatLetterByposterIdx(connection, posterIdx)

  // idx로 닉네임 추출해서 기존 객체(retrieveChatListResult)에 넣기
  for (var i = 0; i < retrieveChatListResult.length; i++){
    // 닉네임 추출
    var tempRecipientNickname = await userDao.selectUserNicknameByIdx(connection, retrieveChatListResult[i].recipientIdx)
    var tempSenderNickname = await userDao.selectUserNicknameByIdx(connection, retrieveChatListResult[i].senderIdx)

    // 기존객체(retrieveChatListResult)에 새로운 key(recipientNickname, senderNickname)값과 
    // value(tempRecipientNickname, tempSenderNickname) 넣기
    retrieveChatListResult[i].recipientNickname = tempRecipientNickname
    retrieveChatListResult[i].senderNickname = tempSenderNickname
  }

  //console.log(retrieveChatListResult)
  return retrieveChatListResult

  // for (var i = 0; i < retrieveChatListResult.length; i++){
  //   test = {key[i] : value[i]}
  // }

  connection.release();
}
