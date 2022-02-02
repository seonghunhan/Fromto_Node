
// 새롭게 추가한 함수를 아래 부분에서 export 해줘야 외부의 Provider, Service 등에서 사용가능합니다.

// id, email로 계정 중복체크
async function selectUserId(connection, userId) {
    const list = [userId] // 이렇게 리스트로 해서 쿼리문에 넣어야 ?두개짜리 실행가능
    const selectUserIdQuery = `
                   SELECT id, nickname 
                   FROM UserInfo 
                   WHERE id = ? ;
                   `;
    const [userRow] = await connection.query(selectUserIdQuery, list);
    // console.log(userRow) 
    return userRow;
  }

// nickname로 계정 중복체크
async function selectUserNickname(connection, nickname) {

  const selectUserIdQuery = `
                 SELECT id, nickname 
                 FROM UserInfo 
                 WHERE nickname = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, nickname);
  // console.log(userRow) 
  return userRow;
}  

// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickname 
                FROM UserInfo;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// // 아이디로 회원 조회
// async function selectUserId(connection, id) {
//   const selectUserEmailQuery = `
//                 SELECT id, nickname 
//                 FROM UserInfo 
//                 WHERE id = ?;
//                 `;
//   const [userRows] = await connection.query(selectUserEmailQuery, id);
//   return userRows;
// }

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO UserInfo(id, password, nickname, birth, gender)
        VALUES (?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT id, password
        FROM UserInfo 
        WHERE id = ? AND password = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );
  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
// 로그인할때!!여기서 id랑 idx가져오는데 여기서 가져오는 idx기준으로 회원관련 정보를
// 여기서 끌고온다!!!!!!!
async function selectUserAccount(connection, id) {
  const selectUserAccountQuery = `
        SELECT  id, idx
        FROM UserInfo 
        WHERE id = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      id
  );
  // console.log(selectUserAccountRow[0])
  return selectUserAccountRow[0];
}

async function updateAuthCode(connection, code, email){
  const list = [code, email]
  const updateCodeQuery =  `
  INSERT INTO authCode (emailcode, id)
  VALUES (?, ?);`;
  const updateCodeRow = await connection.query(updateCodeQuery, list);
  return updateCodeRow;
}

async function selectAuthCode(connection,email){
  const selectCodeQuery = `
  SELECT  emailcode
  FROM authCode 
  WHERE id = ?;`;
  const selectCodeRow = await connection.query(selectCodeQuery,email);
  return selectCodeRow;
}

async function deleteAuthCode(connection, email){
  const deleteCodeQuery = `
  DELETE FROM authCode
  WHERE id = ?;
  `;
  const deleteCode = await connection.query(deleteCodeQuery, email);
  //console.log(deleteCode)
  return deleteCode;
}

async function selectUserInfoforPassword(connection, birth, gender, id) {
  const list = [birth, gender, id];
  const selectUserInfoQuery = `
  SELECT id, nickname
  FROM UserInfo
  WHERE birth = ? AND gender = ? AND id = ?;
  `;
  const selectUserRow = await connection.query(selectUserInfoQuery, list);
  //console.log(selectUserRow[0][0])
  return selectUserRow[0][0]
}

async function updatePasswordAuthcode(connection, ranNum, id){
  const list = [ranNum, id]
  const updatePasswordCode = `
  INSERT INTO authCode (passwordcode, id)
  VALUES (?,?);
  `;
  const updateCodeRow = await connection.query(updatePasswordCode, list);

  return(updateCodeRow)
 
}

async function passwordAuthcodeCheck(connection,email){
    const selectCodeQuery = `
    SELECT  passwordcode
    FROM authCode 
    WHERE id = ?;`;
    const selectCodeRow = await connection.query(selectCodeQuery,email);
  
    return selectCodeRow;
  }

async function deletePasswordAuthCode(connection, email){
    const deleteCodeQuery = `
    DELETE FROM authCode
    WHERE id = ?;
    `;
    const deleteCode = await connection.query(deleteCodeQuery, email);
    //console.log(deleteCode)
    return deleteCode;
  }

async function updatePassword(connection, email, password) {
    const updateUserQuery = `
    UPDATE UserInfo 
    SET password = ?
    WHERE id = ?;`;
    const updateUserRow = await connection.query(updateUserQuery, [password, email]);
    return updateUserRow[0];
}

async function selectUserMypage1(connection, userIdx) {
  const selectMypageInfoQuery = `
  SELECT UserInfo.nickname
  FROM UserInfo INNER JOIN MyPage ON UserInfo.idx = MyPage.userIdx
  WHERE UserInfo.idx = ?;
  `;
  const selectMypageInfoRow = await connection.query(selectMypageInfoQuery, userIdx);
  //console.log(selectMypageInfoRow[0][0].nickname)
  return selectMypageInfoRow[0][0].nickname;
}

async function selectUserMypage2(connection, userIdx) {
  const selectMypageInfoQuery = `
  SELECT profileImgUrl
  FROM MyPage
  WHERE userIdx = ?;
  `;
  const selectMypageInfoRow = await connection.query(selectMypageInfoQuery, userIdx);
  //console.log(selectMypageInfoRow[0][0].profileImgUrl)
  return selectMypageInfoRow[0][0].profileImgUrl;
}

async function selectUserIdx(connection, userIdx) {
  const selectuserIdxQuery = `
  SELECT userIdx
  FROM MyPage
  WHERE userIdx = ?;
  `;
  const selectResultRow = await connection.query(selectuserIdxQuery, userIdx);


  return selectResultRow[0]
}

async function insertNewprofileImgUrl(connection, userIdx, ImgUrl) {
  const insertQuery = `
  INSERT INTO MyPage (userIdx, profileImgUrl)
  VALUES (?,?);
  `;
  const insertResultRow = await connection.query(insertQuery, [userIdx, ImgUrl]);

  console.log(insertResultRow[0])
  return insertResultRow[0]
}

async function updateprofileImgUrl(connection, userIdx, ImgUrl) {
  const updateProfileUrlQuery = `
  UPDATE MyPage
  SET profileImgUrl = ?
  WHERE userIdx = ?;
  `;
  const updateResultRow = await connection.query(updateProfileUrlQuery, [ImgUrl, userIdx]);
  console.log(updateResultRow)
  //return selectMypageInfoRow[0][0].profileImgUrl;
}

module.exports = {
  selectUser,
  selectUserId,
  selectUserNickname,
  selectUserId,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateAuthCode,
  selectAuthCode,
  selectUserInfoforPassword,
  deleteAuthCode,
  updatePasswordAuthcode,
  passwordAuthcodeCheck,
  deletePasswordAuthCode,
  updatePassword,
  selectUserMypage1,
  selectUserMypage2,
  selectUserIdx,
  insertNewprofileImgUrl,
  updateprofileImgUrl,
};