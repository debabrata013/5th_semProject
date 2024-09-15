const JWT=require('jsonwebtoken')
const secret="$uperMan@123"
function createToken(user){
    const payload={
        _id:user.id,
        email:user.email,
        profileImgURL:user.profileImgURL,
        role:user.role
    };
    const token=JWT.sign(payload,secret,{
        expiresIn:60*60
    })  ;
  
    return token
}
function verifyToken(token){
    try{
        const decoded=JWT.verify(token,secret)
        return decoded
        }catch(err){
            return null
            }
        }
module.exports={
    createToken,
    verifyToken
}