const authUser = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token){
        return res.redirect('/login');
    }
    next();
}

module.exports={authUser}