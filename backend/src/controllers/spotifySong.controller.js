const path = require('path');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const dotEnv = require('dotenv');
dotEnv.config();
const db = require('../lib/db');
const SpotifyWebApi = require('spotify-web-api-node');
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
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    db.query(query, async (err, result) => {
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
  const query = `SELECT song_id,id FROM playlist_songs WHERE playlist_id = '${playlist_id}' `;
  db.query(query, async (err, songs) => {
    if (err) {
      console.error('Error fetching songs:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Songs:', songs);
    res.status(200).json(songs);
  });

}

module.exports = { downloadSpotifyTrack, createSpotifyPlaylist,getSpotifyPlaylists ,getPlaylistSongs };
