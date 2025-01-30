const path = require('path');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const dotEnv = require('dotenv');
dotEnv.config();
const db = require('../lib/db');
const SpotifyWebApi = require('spotify-web-api-node');
const { log } = require('console');
// Spotify API setup

const downloadSpotifyTrack = (req, res) => {
  const { name, artist } = req.body;
  const query = `${name} ${artist}`;
  const outputDir = path.resolve(__dirname, 'downloadsForSpotify');
  const outputPath = path.join(outputDir, `${name}.mp3`);

  // yt-dlp command
  const command = `yt-dlp --extract-audio --audio-format mp3 -o "${outputPath}" "ytsearch1:${query}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error downloading song:', error);
      return res.status(500).json({ error: 'Failed to download song' });
    }
    console.log('Download complete:', stdout);
    res.json({ message: 'Song downloaded successfully', path: `/downloads/${name}.mp3` });
  });
};


const createSpotifyPlaylist = async (req, res) => {
  const token = req.cookies.jwt;
  const name = req.body.name;
  try {
    const data = jwt.decode(token, process.env.JWT_SECRET);
    const email = data.userName;
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], async (err, result) => {
      const user = result[0];
      const user_id = user.user_id;
      // Create a new Spotify playlist
      const playlist_id = uuidv4();
      const q = `INSERT INTO playlists (name, user_id,playlist_id) VALUES (?,?, ?)`;
      await db.query(q, [name, user_id, playlist_id]);
      res.status(200).json({ message: 'Playlist created successfully', playlist_id });
    })


  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}


const addLikeToSong = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const email = jwt.decode(token, process.env.JWT_SECRET).userName;
    // Get user_id from email
    const q = "SELECT user_id FROM users WHERE email = ?";
    db.query(q, [email], async (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (result.length === 0) return res.status(404).json({ error: "User not found" });

      const user_id = result[0].user_id;
      const song_id = req.body.trackId;
      const thumbnail= req.body.trackThumbnail;
      const song_name = req.body.trackName;
      const artist_name = req.body.trackArtist;

      // Check if the song is already liked
      const query = "SELECT * FROM likes WHERE user_id = ? AND song_id = ?";
      db.query(query, [user_id, song_id], (err, results) => {
        
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
          // Unlike the song
          
          db.query("DELETE FROM likes WHERE user_id = ? AND song_id = ?", [user_id, song_id], (err, result) => {

            if (err) return res.status(500).json({ error: "Database error" });
            return res.json({ message: "Song unliked successfully" }); // 🔹 RETURN to prevent further execution
          });
        } else {
          
          // Like the song
          const like_id = uuidv4();
          db.query("INSERT INTO likes (user_id, song_id, like_id ,song_name ,song_thumbnail,song_artist) VALUES (?, ?, ?,?,?,?)", [user_id, song_id, like_id,song_name,thumbnail,artist_name], (err, result) => {
            
            if (err) {
              console.error('Error inserting like:', err.message);
              return res.status(500).json({ error: 'Internal server error' });
            }
            return res.json({ message: "Song liked successfully" }); // 🔹 RETURN to prevent further execution
          });
        }
      });
    });
  } catch (error) {
    log('Error creating playlist:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLikedSongs = async (req, res) => {
  const token = req.cookies.jwt;
  const data = jwt.decode(token, process.env.JWT_SECRET);
  const email = data.userName;
  const query = `SELECT user_id FROM users WHERE email = '${email}'`;
  db.query(query, async (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const user_id = result[0].user_id;
    const query = `SELECT * FROM likes WHERE user_id =?`;
    db.query(query, [user_id], async (err, likedSongs) => {
      if (err) {
        console.error('Error fetching liked songs:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json(likedSongs);
    });
  });
}


const getSpotifyPlaylists = async (req, res) => {
  const token = req.cookies.jwt;
  const data = jwt.decode(token, process.env.JWT_SECRET);
  const email = data.userName;
  try {
    const query = `SELECT user_id FROM users WHERE email = '${email}'`;
    db.query(query, async (err, result) => {
      if (err) {
        console.error('Error fetching user data:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
      const user_id = result[0].user_id;
      const q = `SELECT playlist_id, name FROM playlists WHERE user_id =?`
      db.query(q, [user_id], async (err, playlists) => {
        if (err) {
          console.error('Error fetching playlists:', err.message);
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(playlists);
      })
    })

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

const getPlaylistSongs = async (req, res) => {
  const playlist_id = req.query.playlist_id;
  console.log('Playlist ID:', playlist_id);
  // Fetch songs from playlist_songs table with playlist_id
  const query = `SELECT song_id,id FROM playlist_songs WHERE playlist_id = ?`;
  db.query(query, [playlist_id], async (err, songs) => {
    if (err) {
      console.error('Error fetching songs:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Songs:', songs);
    res.status(200).json(songs);
  });

}

module.exports = { downloadSpotifyTrack, createSpotifyPlaylist, getSpotifyPlaylists, getPlaylistSongs,addLikeToSong,getLikedSongs };
