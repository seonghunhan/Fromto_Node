module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/app/test', user.getTest)

    // 1. 유저 생성 (회원가입) API
    app.post('/app/newusers', user.postUsers);

    // 2. 아이디 이메일 중복 체크 API
    app.get('/app/users/:id', user.checkInfoById);

    // 3. 닉네임 중복 체크 API
    app.get('/app/usersCheck/:nickname', user.checkInfoByNickname);

    // 4. 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 5. 이메일 인증 API
    app.post('/app/newusers/authemail', user.authemail);

    // 6. 인증코드 체크 API
    app.post('/app/newusers/authcodeCheck', user.checkCode);

    // 7. 비밀번호 바꾸기 인증번호 API
    app.post('/app/users/changePassword', user.changePasswordAuthcode);



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