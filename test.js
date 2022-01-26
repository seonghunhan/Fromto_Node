var nodeMailer = require('nodemailer');

//메일 발송 서비스에 대한 환경 설정하기
var myMale= nodeMailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  tls: true,
  port: 587,
  auth: {
    user: 'fromto.dear.sincerely@gmail.com',
    pass: 'fromto@0102'
  }
});


//메일 받을 유저설정하기
var mailOption = {
    from: '"FromTo" <fromto.dear.sincerely@gmail.com>',
    to: 'hsh931212@naver.com' ,
    subject: 'fromto',
    text: 'fromto'
  };


  //메일 전송
  myMale.sendMail(mailOption, function(error, info){
    if (error) {
        console.log('에러 발생!!!' + error);
    }
      else {
        console.log('전송이 완료 되었습니다.' + info.response);
    }
});


