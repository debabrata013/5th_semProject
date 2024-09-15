const {Router}=require('express')
const {model}=require('mongoose')
const User=require('../models/user')
const  Otpm = require( '../services/otp');
const  Email = require( '../services/email');
const  Text = require( '../services/text');


const router=Router();
router.get('/signin',(req,res)=>{
    return res.render("signin")
})
router.get('/signup',(req,res)=>{
    return res.render("signup")
})
router.get('/forgetpass',(req,res)=>{
    return res.render("forgetpass")
})
router.get('/verify',(req,res)=>{
    return res.render("verifymail")
})
router.get('/admin/booking',(req,res)=>{
    return res.render("admin_booking")
})
router.get('/admin/users',(req,res)=>{
    return res.render("admin_users")
})
router.get('/admin/payment',(req,res)=>{
    return res.render("admin_payment")
})
router.get('/payment',(req,res)=>{
    return res.render("buy")
})

// mnss jiuz msbm lnjy

router.post('/signup',async(req,res)=>{
    const{fullName,email,password,carno}=req.body;
    try{
    await User.create({
        fullName,
        carno,
        email,
        password,
    });
    Email(email,'Welcome mail',Text.welcometext(fullName));}
    catch(err){
        return res.redirect("/");
        // return res.status(400).json({message:err.message})
        }
    return res.redirect("/");
   
})
router.post('/signin',async(req,res)=>{
    const{email,password}=req.body;
    try{
   const token= await User.matchpassword(email,password)
   console.log(token);
   res.cookie('token', token).redirect("/")
    }catch(e){
     
        console.log(e);
        const error=e.toString()
        return res.render('signin',{
            error:error
        })
    }
   
})
router.post('/verify', async (req, res) => {
    try {
        const { email } = req.body;

        // Correctly find the user by email
        var user = await User.findOne({ email: email });
   
        if (user) {
            // Generate an OTP and save it to the user
            const otpc = Otpm(6);
         
           
           const op=await user.updateOne({$set:{
                otp:otpc
            }})
           
            // Send an email with the OTP
            Email(email, 'Verify mail', Text.otptext(otpc));
           
            return res.redirect("/user/forgetpass");
        } else {
            // User not found
            return res.json({
                message: "User not found"
            });
        }
    } catch (error) {
        // Handle any errors
        console.error(error);
        return res.status(500).json({
            message: "An error occurred"
        });
    }
});
router.post('/forgetpass', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email: email });

        if (user) {
            console.log(user.otp);
            console.log(user);
            if (user.otp === otp) {
                // await user.updateOne({ $set: { password: password } });
                     user.password = password;
                    await user.save();
                return res.redirect('/');
            } else {
                const otpc = Otpm(6);
                await user.updateOne({ $set: { otp: otpc } });
                Email(email, 'Verify mail', Text.otptext(otpc));
                return res.json({ message: 'OTP does not match, a new OTP is sent. Check your email.' });
            }
        } else {
            return res.json({ message: 'User not found with the provided email.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
router.get('/logout',(req,res)=>{
    res.clearCookie("token").redirect("/")
})

module.exports=router;