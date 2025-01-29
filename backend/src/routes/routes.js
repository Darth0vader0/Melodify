const signup = (req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/signup.html");
}
const login = (req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/login.html");
}
const home=(req,res)=>{ 
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/home.html");
}
const profile=(req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/profile.html");
}
const searchOnYoutube = (req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/searchOnYoutube.html")
}
const searchSpotifySongs =(req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/searchOnSpotify.html")
}
const updateProfile = (req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/updateProfile.html")
}
const library = (req,res)=>{
    res.sendFile("C:/Users/kamal/Desktop/Melodify/public/library.html")
}
module.exports = {signup,login,home,profile,searchOnYoutube,updateProfile,searchSpotifySongs,library};

