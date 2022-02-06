module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/newusers', user.postUsers);

    // 2. 아이디 중복 체크 API
    app.get('/app/users/idcheck/:id', user.checkInfoById);

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
    app.post('/app/users/changePassword', user.changePasswordAuthcode);

    // 9. 비밀번호 바꾸기 API
    app.post('/app/newusers/passwordAuthcodeCheck', user.passwordcheckCode);

    // 10. 비밀번호 인증코드 삭제 API
    app.post('/app/newusers/deletePasswordAuthcode', user.deletePasswordAuthcode);

    // 11. 자동로그인 API
    app.get('/app/auto-login', jwtMiddleware, user.check); // jwtMiddleware페이지 거치고 check간다

    // 12. MyPageUI API
    app.get('/app/login/mypage', jwtMiddleware, user.mypage); 

    // 13. 프로필사진 변경 API
    app.post('/app/login/mypage/changeProfileImgUrl', jwtMiddleware, user.changeProfileUrl);

    // 14. 셋팅 API
    app.get('/app/login/mypage/settings', jwtMiddleware, user.settings);

    // 15. 셋팅 알람설정 API
    app.post('/app/login/mypage/settings/alarmActive', jwtMiddleware, user.alarm);

    // 16. 편지 작성 API (닉네임제공)
    app.get('/app/login/writingLetter', jwtMiddleware, user.getUserNickname);

    // 17. 편지 보내기 API (DB저장)
    app.post('/app/login/sendingLetter', jwtMiddleware, user.postWritedLetter);


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