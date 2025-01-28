const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {authUser} = require ('./src/middlewares/authUser.middelware')
const multer = require('multer');
const upload = multer();

const {login,signup,home,profile,searchOnYoutube,updateProfile,searchSpotifySongs} = require('./src/routes/routes');
const {download, fetchYoutubeData,searchSpotify} = require('./src/controllers/songs.controller');
const {signUp,logIn,checkLogins,logout} = require('./src/controllers/auth.controller');
const {fetchUserData} = require('./src/controllers/user.controller');   
const {uploadPhoto,updatePassword} = require('./src/controllers/profile.controller');
const {downloadSpotifyTrack,createSpotifyPlaylist,getSpotifyPlaylists,getPlaylistSongs} = require('./src/controllers/spotifySong.controller');
// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../public')); // Serve static files
app.use(cookieParser());
// Serves html files
app.get('/',home);
app.get('/login', login);
app.get('/signup', signup);
app.get('/checkLogins',checkLogins);
app.get('/profile',profile);
app.get('/logout',logout);
app.get('/fetchUserData',fetchUserData);
app.get('/searchOnYoutube',authUser,searchOnYoutube);
app.get('/updateProfile',updateProfile)
app.get('/searchSpotifySongs',authUser,searchSpotifySongs)
// Signup endpoint
app.post('/signup',signUp);
app.post('/login',logIn);
app.post('/updateProfile',upload.single('photo'),uploadPhoto);
app.post("/updatePassword",updatePassword)



// API Endpoint: Fetch YouTube search results
app.get('/fetchYoutubeData', fetchYoutubeData);
app.get('/searchSpotify',searchSpotify)

// API Endpoint: Download YouTube video as MP3
app.post('/download', download);
//api endpoint for spotify
app.post('/downloadSpotifyTrack', downloadSpotifyTrack);
app.post('/createSpotifyPlaylist', createSpotifyPlaylist);
app.get("/getSpotifyPlaylists",getSpotifyPlaylists)
app.get('/getPlaylistSongs', getPlaylistSongs)

// Serve downloaded files
app.use('/downloads', express.static('downloads'));

// print download path
console.log(__dirname + '/downloads');
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
