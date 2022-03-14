module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const multer = require('multer');
    var storage = multer.memoryStorage()
    var upload = multer({storage: storage});


    // // 0. 테스트 API
    app.get('/app/test', user.getTest)

    // 0. s3 테스트 API
    app.post('/app/s3test', upload.single("img"), user.s3getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/newusers', user.postUsers);

    // 2. 아이디 중복 체크 API
    app.get('/app/users/idcheck/:id', user.checkInfoById);

    // 2.5 계정 삭제 API
    app.get('/app/users/deleteAccount', jwtMiddleware, user.deleteAccount )

    // 3. 닉네임 중복 체크 API
    app.get('/app/users/nicknamecheck/:nickname', user.checkInfoByNickname);

    // 4. 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 5. 이메일 인증 API
    app.post('/app/newusers/authemail', user.authemail);

    // 6. 인증코드 체크 API
    app.post('/app/newusers/authcodeCheck', user.checkCode);

    // 7. 회원가입 인증코드 삭제 API
    app.post('/app/newusers/deleteAuthcode', user.deleteEmailAuthcode);

    // 8. 비밀번호 바꾸기 인증번호 API
    app.post('/app/users/passwordAuthcodeCheck', user.changePasswordAuthcode);

    // 9. 비밀번호 바꾸기 API
    app.post('/app/newusers/changePassword', user.passwordcheckCode);
    
    // 10. 비밀번호 인증코드 삭제 API
    app.post('/app/newusers/deletePasswordAuthcode', user.deletePasswordAuthcode);

    // 11. 자동로그인 API
    app.get('/app/auto-login', jwtMiddleware, user.check); // jwtMiddleware페이지 거치고 check간다

    // 12. MyPageUI API (닉네임, 사진불러오기)
    app.get('/app/login/mypage/userInfo', jwtMiddleware, user.getMypageInfo); 

    // 13. MyPageUI API (내가쓴편지 포스터 url불러오기)
    app.get('/app/login/mypage/writtenPosterurl', jwtMiddleware, user.getMypageProfileurl); 

    // 14. 프로필사진 변경 API
    app.post('/app/login/mypage/changeProfileImgUrl',jwtMiddleware, upload.single("img"), user.changeProfileUrl);

    // 15. 셋팅 API
    app.get('/app/login/mypage/settings', jwtMiddleware, user.settings);

    // 16. 셋팅 알람설정 API
    app.post('/app/login/mypage/settings/alarmActive', jwtMiddleware, user.alarm);

    // 16.5 필명 변경 API (24번 UI)
    app.post('/app/login/mypage/settings/changeNickname', jwtMiddleware, user.getChangeNickname);

    // 17. 편지 작성 API (닉네임제공)
    app.get('/app/login/writingLetter', jwtMiddleware, user.getUserNickname);

    // 17.5 포스터 선택 API (앨범에서 포스터 고를 때)
    app.post('/app/login/writingLetter/savePoster', jwtMiddleware, upload.single("img"), user.postPosterFile);

    // 18. 편지 보내기 API (DB저장)
    app.post('/app/login/sendingLetter', jwtMiddleware, user.postWritedLetter);

    // 19. 안읽은 편지 유무 API (홈으로 들어갈때 안읽은 편지 유무 제공)
    app.get('/app/login/ischeckedLetter', jwtMiddleware, user.getischeckLetter);

    // 20. 안읽은 편지 클릭 API
    app.get('/app/login/readingLetter', jwtMiddleware, user.getLetterInfo); // ischeckd에서 false(0)가 안읽은것

    // 20.5. 랜덤 재전송 API (Letter테이블에서 ischecked가 가장 최근에 true로 바뀌는것 이용 -> 다시 false로 바꿔놓고 재전송)
    app.get('/app/login/readingLetter/resending', jwtMiddleware, user.resendingLetter);

    // 20.6 랜덤 data 삭제 API (임시로 저장한 선호도 연령,성별 삭제하는것) 
    app.get('/app/login/readingLetter/deletePreferData', jwtMiddleware, user.deletePreferData);


    // 21. 편지 회신 API (Letter테이블에서 ischecked가 가장 최근에 true로 바뀌는것 이용)
    app.post('/app/login/readingLetter/replyToLetter', jwtMiddleware, user.postReplyInfo )

    // 22. 내가 쓴 영화 API (22번UI) 
    app.get('/app/login/mypage/readingMyMovie', jwtMiddleware, user.getMovieLetterList)

    // 23. 편지함 API (30번 UI)
    app.get('/app/login/mypage/letterbox', jwtMiddleware, user.getLetterList)

    // 24. 채팅 편지함 API (31번 UI)
    app.get('/app/login/mypage/letterbox/chatbox/:posterIdx', jwtMiddleware, user.postChatBox)

    // // 25. 채팅 내용 API (31번UI에서 12번UI로 이동할 때)
    // app.post('/app/login/mypage/letterbox/chatbox/readingChat', jwtMiddleware, user.getChatContents)
    

    


    // // 3. 유저 조회 API (+ 검색)
    // app.get('/app/users',user.getUsers); 

    // // 아래 부분은 7주차에서 다룸.
    // // TODO: After 로그인 인증 방법 (JWT)
    // // 로그인 하기 API (JWT 생성)
    // app.post('/app/login', user.login);

    // // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    // app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)



};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API