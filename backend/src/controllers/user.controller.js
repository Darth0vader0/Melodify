const jwt = require('jsonwebtoken');
const db = require('../lib/db');
const fetchUserData = (req,res)=>{
    const token = req.cookies.jwt;
    try {
        const data = jwt.decode(token, process.env.JWT_SECRET);
        const email = data.userName;
        const query = `SELECT * FROM users WHERE email = '${email}'`;
        db.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching user data:', err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            const user = result[0];
            if (user.display_picture) {
                user.display_picture = user.display_picture.toString('base64');
            }else {
                user.display_picture = null;
            }
            
            res.status(200).json({userName : user.profile_name,display_picture : user.display_picture});
        });
    } catch (error) {
        console.log("internal server error ", error.message);
    }
}

module.exports = {fetchUserData};