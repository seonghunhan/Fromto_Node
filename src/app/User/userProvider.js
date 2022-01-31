const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

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

exports.authcodeUpdate = async function (code, email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateCode = await userDao.updateAuthCode(connection, code, email);
  connection.release();

  return updateCode;
}

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

exports.passwordAuthcodeUpdate = async function(ranNum, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatePasswordCode = await userDao.updatePasswordAuthcode(connection, ranNum, id);
  connection.release();
}

exports.passwordAuthcodeCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCode = await userDao.passwordAuthcodeCheck(connection,email);
  connection.release();
  const realcode = selectCode[0][0].passwordcode;
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
  connection.release();
  const resultRow = [selectNickname, selectImgUrl]
  return resultRow

}