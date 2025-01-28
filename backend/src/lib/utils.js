const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');
dotEnv.config();

 function jwtGenerator(userName,res){
    const token = jwt.sign({userName},process.env.JWT_SECRET,{
        expiresIn:'10d'
    });
    res.cookie("jwt",token,{
        maxAge :10*24*60*60*1000,
        httpOnly:true,
        secure:process.env.NODE_ENV!=="development"
    });


}

module.exports = jwtGenerator;