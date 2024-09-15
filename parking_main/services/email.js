const nodemailer = require('nodemailer');

async function  sendMail(to, subject, text) {
  // Create a transporter object
  let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'pattnaikd833@gmail.com', 
      pass: 'mnssjiuzmsbmlnjy' 
    }
  });

  // Set up email data
  let mailOptions = {
    from: '"AutoSpot" pattnaikd833@gmail.com', // Sender address
    to: to, // List of recipients
    subject: subject, // Subject line
    text: text, // Plain text body
    // html: '<b>Hello world?</b>' // Uncomment if you want to send HTML email
  };

  // Send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
}

module.exports=sendMail;