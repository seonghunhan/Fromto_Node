
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

async function deleteAccount(connection, userIdx) {
  const deleteAccountQuery = `
  DELETE FROM UserInfo
  WHERE idx = ?;
  `
  const resultRow = await connection.query(deleteAccountQuery, userIdx);
  return resultRow
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

async function selectUserNicknameForChange(connection, nickname, userIdx) {


  const selectUserIdQuery = `
  SELECT id, nickname
  FROM UserInfo
  WHERE nickname = ? and idx not in (?);
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, [nickname, userIdx]);
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
        INSERT INTO UserInfo(id, password, nickname, birth, gender, age)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

async function selectUserAge(connection){
  const selectQuery = `
  SELECT birth, gender
  FROM UserInfo
  WHERE idx = '?';
  `;
  const selectResultRow = await connection.query(selectQuery)

  return(selectResultRow[0][0])
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
  console.log(email)
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

async function selectUserMypage3(connection, userIdx) {
  const selectPosterurlQuery = `
  select MovieProfileImg.movieImgUrlForLetter
  from MovieProfileImg inner join Letter on MovieProfileImg.idx = Letter.posterIdx
  where Letter.senderIdx = ?
  ORDER BY MovieProfileImg.updateAt ASC
  LIMIT 3;
  `;
  const selectPosterurlRow = await connection.query(selectPosterurlQuery, userIdx);

  return selectPosterurlRow[0]
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

async function selectSettingsParmes(connection, userIdx) {
  const selectSettingsQuery = `
  SELECT id, alarm
  FROM UserInfo
  WHERE idx = ?;
  `;
  const selectResultRow = await connection.query(selectSettingsQuery, userIdx)
  return selectResultRow[0][0]
}

async function updateAlarm(connection, userIdx, alarm){
    const updateAlarmQuery = `
    UPDATE UserInfo
    SET alarm = ?
    WHERE idx = ?;
    `;
    const updateResultRow = await connection.query(updateAlarmQuery, [alarm, userIdx])
    return updateResultRow
}

async function updateNickname(connection, userIdx, newNickname){
  const updateQuery = `
  UPDATE UserInfo
  SET nickName = ?
  WHERE idx = ?;
  `;
  const updateResultRow = await connection.query(updateQuery, [newNickname, userIdx])
  console.log(updateResultRow[0])
  // console.log(updateResultRow[0].changedRows)
  // console.log("여기!"+updateResultRow[0].info.Warning)
  return [updateResultRow[0].changedRows, updateResultRow[0].warningStatus]
}

async function selectUserNicknameByIdx(connection, userIdx) {

  const selectuserNicknameQuery = `
  SELECT nickname
  FROM UserInfo
  WHERE idx = ?;
  `;
  const selectResultRow = await connection.query(selectuserNicknameQuery, userIdx);
  //console.log(selectResultRow[0][0].nickname)
  
  return selectResultRow[0][0].nickname
}

async function selectUserIdxList(connection){
  const selectQuery = `
  SELECT idx
  FROM UserInfo ;
  `; 
  const selectResultRow = await connection.query(selectQuery);
  return selectResultRow[0]
}

async function selectUserIdxListByFilter1(connection, preferGender){
  const selectQuery = `
  SELECT idx
  FROM UserInfo
  WHERE gender = ?
  `; 
  const selectResultRow = await connection.query(selectQuery, preferGender);
  return selectResultRow[0]
}

async function selectUserIdxListByFilter2(connection, preferAge, preferAge2){
  const selectQuery = `
  SELECT idx
  FROM UserInfo
  WHERE age >= ? and age < ?;
  `; 
  const selectResultRow = await connection.query(selectQuery, [preferAge, preferAge2]);
  return selectResultRow[0]
}

async function selectUserIdxListByFilter3(connection, resultList, preferGender, preferAge, preferAge2){
  const selectQuery = `
  SELECT idx
  FROM UserInfo
  WHERE idx in (?) and gender = ? and age >= ? and age < ?;
  `; 
  const selectResultRow = await connection.query(selectQuery, [resultList, preferGender, preferAge, preferAge2]);
  console.log( [resultList, preferGender, preferAge, preferAge2])
  return selectResultRow[0]
}

async function insertPosterurl(connection, posterurl) {
  const insertQuery = `
  INSERT INTO MovieProfileImg (movieImgUrlForLetter)
  VALUES (?);
  `;
  const insertResultRow = await connection.query(insertQuery, posterurl);
  return insertResultRow[0].insertId
}

// async function selectUseridxByNickname(connection, recipientNickname) {
//   const selectuserIdxQuery = `
//   SELECT idx
//   FROM UserInfo
//   WHERE nickname = ?;
//   `;
//   const selectResultRow = await connection.query(selectuserIdxQuery, recipientNickname);

//   return selectResultRow[0][0]
// }

async function insertLetterInfo(connection, letterTitle, movieTitle, contents, senderIdx, recipientIdx, poseterIdx, spoStatus) {
  const insertQuery = `
  INSERT INTO Letter (letterTitle, movieTitle, contents, senderIdx, recipientIdx, posterIdx, spoStatus)
  VALUES (?,?,?,?,?,?,?);
  `;
  const insertResultRow = await connection.query(insertQuery, [letterTitle, movieTitle, contents, senderIdx, recipientIdx, poseterIdx, spoStatus]);
  //return insertResultRow[0].insertId
}

async function selectCountIscheckedLetter(connection, userIdx) {
  const selectQuery = `
  SELECT COUNT(*)
  FROM Letter
  WHERE recipientIdx = ? AND ischecked = false;
  `;
  const selectResultRow = await connection.query(selectQuery, userIdx);
  const ResultRow = selectResultRow[0][0]

  return Object.values(ResultRow)[0]
}

async function selectFirstLetterIdx(connection, useridx){
  const selectQuery = `
  select idx, posterIdx
  from Letter
  where recipientIdx = ? and ischecked = true
  order by createAt asc
  limit 1;
  `;
  const selectResultRow =  await connection.query(selectQuery, useridx);

  return selectResultRow[0][0]
}

async function updateLetterIschecked(connection, idx){
  const updateQuery = `
  UPDATE Letter
  SET ischecked = TRUE
  WHERE idx = '?';
  `;
  const updateResultRow = await connection.query(updateQuery, idx);
}

async function selectposterurl(connection, idx){
  const selectQuery = `
  SELECT movieImgUrlForLetter
  FROM MovieProfileImg
  WHERE idx = '?';
  `;
  const updateResultRow = await connection.query(selectQuery, idx);
  return updateResultRow[0][0]
}

async function selectLetterInfo(connection, idx){
  const selectQuery = `
  SELECT letterTitle, movieTitle, contents, senderIdx, recipientIdx
  FROM Letter
  WHERE idx = '?';
  `;
  const selectResultRow = await connection.query(selectQuery, idx)

  return selectResultRow[0][0]
}

async function selectReplyLetterInfo(connection, idx){
  const selectQuery = `
  SELECT letterTitle, movieTitle, senderIdx, posterIdx
  FROM Letter
  WHERE recipientIdx = '?'
  order by updatedAt desc
  limit 1;
  `
  const selectResultRow = await connection.query(selectQuery, idx)
  return selectResultRow
}

async function insertReplyLetterInfo(connection, letterTitle, movieTitle, contents, recipientIdx, senderIdx, posterIdx){
  const insertQuery = `
  INSERT INTO FromTo.ReplyLetter (letterTitle, movieTitle, contents, recipientIdx, senderIdx, posterIdx)
  VALUES (?, ?, ?, ?, ?, ?)
  `
  const insertResultRow = await connection.query(insertQuery, [letterTitle, movieTitle, contents, recipientIdx, senderIdx, posterIdx])
  console.log(insertResultRow)
}

async function selectMovieLetterListByIdx(connection, idx){
  const selectQuery = `
  SELECT letterTitle, posterIdx
  FROM Letter
  WHERE senderIdx = '?' OR recipientIdx = '?'
  ORDER BY posterIdx
  `;
  const selectResultRow = await connection.query(selectQuery, [idx, idx])

  //console.log(selectResultRow[0][0].posterIdx)
  return selectResultRow[0]
}

async function selectLetterListByPosterIdx(connection, posterIdx){
  const selectQuery = `
  select Letter.letterTitle, Letter.posterIdx, MovieProfileImg.movieImgUrlForLetter
  from Letter inner join MovieProfileImg on Letter.posterIdx = MovieProfileImg.idx
  where Letter.posterIdx = '?' ;
  `; 
  const selectResultRow = await connection.query(selectQuery, posterIdx);
  return selectResultRow[0]
}

async function selectMyInfoByIdx(connection, idx){
  const selectQuery = `
  SELECT gender, age
  FROM UserInfo
  WHERE idx = ?
  `;
  const selectResultRow = await connection.query(selectQuery, idx)

  //console.log(selectResultRow[0][0].posterIdx)
  return selectResultRow[0][0]
}

async function selectLetterInfoByIschecked(connection, idx){
  const selectQuery = `
  SELECT letterTitle, movieTitle, contents, posterIdx, senderIdx
  FROM Letter
  WHERE recipientIdx = ? and ischecked = true
  ORDER by createAt desc
  limit 1;
  `;
  const selectResultRow = await connection.query(selectQuery, idx)

  //console.log(selectResultRow[0][0].posterIdx)
  console.log( selectResultRow[0][0])
  return selectResultRow[0][0]
}

async function insertPrefer(connection, senderIdx, preferGender1, preferAge1){
  const insertQuery = `
  INSERT INTO FromTo.tempPreferInfo (senderIdx, preferAge, preferGender)
  VALUES (?,?,?)
  `
  const insertResultRow = await connection.query(insertQuery, [senderIdx, preferAge1, preferGender1])
}

async function selectPreferInfo(connection, idx){
  const selectQuery = `
  SELECT preferAge, preferGender
  FROM tempPreferInfo
  WHERE senderIdx = ? 
  `;
  const selectResultRow = await connection.query(selectQuery, idx)

  //console.log(selectResultRow[0][0].posterIdx)
  return selectResultRow[0][0]
}

async function updateResendingLetter(connection, userIdx, recipientIdx){
  const updateQuery = `
  UPDATE Letter
  SET ischecked = TRUE , recipientIdx = ?
  WHERE recipientIdx = ? and ischecked = true
  ORDER by createAt desc
  limit 1;
  `;
  const selectResultRow = await connection.query(updateQuery, [recipientIdx, userIdx])
}

async function deletePreferData(connection, senderIdx){
  const deleteCodeQuery = `
  DELETE FROM tempPreferInfo
  WHERE senderIdx = ?;
  `;
  const deleteCode = await connection.query(deleteCodeQuery, senderIdx);
  return deleteCode;
}

async function selectLetterListByIdx(connection, idx){
  const selectQuery = `
  SELECT letterTitle, movieTitle, senderIdx, posterIdx
  FROM Letter
  WHERE senderIdx = '?' OR recipientIdx = '?'
  ORDER BY posterIdx
  `;
  const selectResultRow = await connection.query(selectQuery, [idx, idx])

  //console.log(selectResultRow[0][0].posterIdx)
  return selectResultRow[0]
}

async function selectLetterListByPosterIdxForLetterBox(connection, posterIdx){
  const selectQuery = `
  select Letter.letterTitle, Letter.posterIdx, Letter.movieTitle, MovieProfileImg.movieImgUrlForLetter, UserInfo.nickname
  from Letter inner join MovieProfileImg on Letter.posterIdx = MovieProfileImg.idx
  inner join UserInfo on Letter.senderIdx = UserInfo.idx
  where Letter.posterIdx = ? ;
  `; 
  const selectResultRow = await connection.query(selectQuery, posterIdx);
  return selectResultRow[0]
}

async function selectchatLetterByposterIdx(connection, posterIdx){
  const selectQuery = `
  SELECT senderIdx, recipientIdx, date_format(createAt, '%Y.%m.%d') as date, contents, ischecked
  FROM Letter
  WHERE posterIdx = ?; 
  `;
  const selectResultRow = await connection.query(selectQuery, posterIdx)
  return selectResultRow[0]
}

module.exports = {
  selectUser,
  selectUserId,
  deleteAccount,
  selectUserNickname,
  selectUserNicknameForChange,
  selectUserId,
  selectUserAge,
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
  selectUserMypage3,
  selectUserIdx,
  insertNewprofileImgUrl,
  updateprofileImgUrl,
  selectSettingsParmes,
  updateAlarm,
  updateNickname,
  selectUserNicknameByIdx,
  selectUserIdxList,
  selectUserIdxListByFilter1,
  selectUserIdxListByFilter2,
  selectUserIdxListByFilter3,
  insertPosterurl,
  insertLetterInfo,
  selectCountIscheckedLetter,
  selectFirstLetterIdx,
  updateLetterIschecked,
  selectposterurl,
  selectLetterInfo,
  selectReplyLetterInfo,
  insertReplyLetterInfo,
  selectMovieLetterListByIdx,
  selectLetterListByPosterIdx,
  selectMyInfoByIdx,
  selectLetterInfoByIschecked,
  insertPrefer,
  selectPreferInfo,
  updateResendingLetter,
  deletePreferData,
  selectLetterListByIdx,
  selectLetterListByPosterIdxForLetterBox,
  selectchatLetterByposterIdx,
};