const db = require('./db');
const jwt = require('jsonwebtoken');
const setDownloadPath = async(req,res)=>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message: 'Unauthorized'});
    }
    const data = jwt.decode(token, process.env.JWT_SECRET);
    email = data.userName;
    const query = `SELECT user_id FROM users WHERE email = '${email}'`;
    db.query(query, async (err, result) => {
        if (err) {
            console.error('Error fetching user data:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const user_id = result[0].user_id;
        const downloadPath = req.body.downloadPath;
        const q = `UPDATE users SET download_path =? WHERE user_id =?`;
        db.query(q, [downloadPath, user_id], async (err, result) => {
            if (err) {
                console.error('Error updating download path:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            console.log('Download path updated successfully' );
            return res.status(200).json({ message: 'Download path updated successfully' });
        });
    });
}

module.exports = {setDownloadPath};