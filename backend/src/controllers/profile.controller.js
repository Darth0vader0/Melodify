const jwt = require('jsonwebtoken')
const db = require('../lib/db');

const bcrypt = require('bcrypt')
const uploadPhoto = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.redirect('/login');
    }
    try {
        const email = jwt.decode(token, process.env.JWT_SECRET).userName;
        const query = `UPDATE users SET display_picture = ? WHERE email = ?`;
        const photo = req.file.buffer;

        db.query(query, [photo, email], (err, result) => {
            if (err) {
                console.error('Error uploading photo:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.redirect('/profile');
        });

    } catch (error) {
        console.error('Error uploading photo:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const updatePassword =  (req,res)=>{
    try {
        const token = req.cookies.jwt;
        const data = jwt.decode(token, process.env.JWT_SECRET);
        const email = data.userName;
        const query = `SELECT * FROM users WHERE email = '${email}'`;

        const { newPassword, oldPassword } = req.body;
        console.log(newPassword)
        console.log(oldPassword)
         db.query(query, async (err, result) => {
            if (err) {
                console.error('Error fetching user data:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            const user = result[0];
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if(!isMatch){
                return res.status().json({msg : 'wrong password'})
            }
             const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
            res.status(200).json({msg : "password changed "});
        });
      
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = { uploadPhoto , updatePassword};