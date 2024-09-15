const{Schema,model}=require('mongoose')
const {createHmac,randomBytes}=require('node:crypto')
const {createToken,verifyToken}=require('../services/auth')
const userSchema=new Schema({
    fullName:{
        type:String,
        require:true
    },  email:{
        type:String,
        require:true,
        unique:true
    },
    salt:{type:String
        

    },
    carno:{
        type:String,
        require:true,unique:true
    },
    coins:{
        type:Number,
        default:0
    },
    otp:{
        type:String,
         default:"vd4500"
    },
    password:{
        type:String,
        require:true
    },profileImgURL:{
        type:String,
        default:'/images/default_user_img.png'
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    }

},{timestamps:true});

userSchema.pre("save",function(next){
    const user=this;
    if(!user.isModified("password"))return;
    const salt=randomBytes(16).toString();
    const hashedPassword=createHmac('sha256',salt).update(user.password).digest("hex");


this.salt=salt;

this.password=hashedPassword
next();
})
userSchema.static("matchpassword",async function(email,password){
    const user=await this.findOne({email})
    if(!user) throw new Error('User not found!');
    const hashedPassword=createHmac('sha256',user.salt)
    .update(password).digest("hex");

   if(hashedPassword!==user.password) throw new Error('Incorrect password');
   const token=createToken(user)
   return token;

        

})
const User=model('User',userSchema);
module.exports=User;