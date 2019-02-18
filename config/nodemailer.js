var nodemailer = require('nodemailer');
const keys=require('./keys');

module.exports={
   sendMail : function(rec,msg){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:keys.email,
      pass:keys.password
    }
  });

  var mailOptions = {
    from: 'rrohan228844@gmail.com',
    to: rec,
    subject: 'Sending Email using Node.js',
    text: msg
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
}