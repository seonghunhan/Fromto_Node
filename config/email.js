const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    tls: true,
    port: 587,
    auth: {
      user: 'fromto.dear.sincerely@gmail.com',
      pass: 'fromto@0102'
    }
  });

  module.exports={
      smtpTransport
  }