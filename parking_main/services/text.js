

   function  welcometext(name){
        let txt=` Subject: A Warm Welcome to Easy Parking

Dear ${name},

We are delighted to extend a warm and heartfelt welcome to you on behalf of the Easy Parking team. Your decision to join our community is greatly appreciated, and we are thrilled to have you with us.

At Easy Parking, our mission is to make your parking experience seamless and stress-free. Our smart parking system is designed to provide you with convenient, efficient, and reliable parking solutions. From real-time space availability to secure payment options, we have crafted a platform that prioritizes your needs and enhances your overall experience.

As you begin using our services, we encourage you to explore the features and benefits that Easy Parking offers. Whether you're looking for the nearest available spot, managing your parking coins, or tracking your bookings, our platform is here to make parking easy and hassle-free.

We are committed to providing you with exceptional service and support. Should you have any questions or require assistance, our dedicated team is ready to help. Please don't hesitate to reach out; your satisfaction is our top priority.

Once again, welcome to Easy Parking. We look forward to serving you and making your parking experience as smooth as possible.

Warm regards,

The Easy Parking Team


`
return txt
    }
  function  otptext(otp){
      let  txt=`
      Subject: Verification OTP for Easy Parking

Dear Valued User,

We hope this message finds you well. To proceed with your account verification on Easy Parking, please use the following One-Time Password (OTP). This OTP is a vital security measure to ensure the protection and confidentiality of your account.

Your OTP: [${otp}]

For your safety, this code is valid only for the next 10 minutes. Please enter this OTP on the Easy Parking platform to complete your verification.

If you encounter any issues or have any questions, please feel free to reach out to our support team.

Thank you for choosing Easy Parking. We are committed to providing you with exceptional service and robust security.

Best Regards,

The Easy Parking Team

Note: If you did not initiate this verification, please contact us immediately to protect your account.
      `
      return txt
    }



module.exports = { welcometext,  otptext};