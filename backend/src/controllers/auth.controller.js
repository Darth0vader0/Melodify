const bcrypt = require('bcrypt');
const jwtGenerator = require('../lib/utils');
const jwt = require('jsonwebtoken')
const db = require('../lib/db');
const { v4: uuidv4 } = require('uuid'); 


const signUp = async (req, res) => {
    const { email, password, profile_name, day, month, year, gender } = req.body;
    console.log(req.body);
    q = `SELECT * FROM users WHERE email = '${email}'`;
    db.query(q, async (err, result) => {
        if (err) {
            console.error('Error checking for existing user:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (result.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        if (!email || !password || !profile_name || !day || !month || !year || !gender) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const date_of_birth = `${year}-${month}-${day}`;

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Generate a unique user ID
            const user_id = uuidv4();
            // SQL query to insert user data
            const query = `
            INSERT INTO users (user_id,email, password, profile_name, date_of_birth, gender) 
            VALUES (?,?, ?, ?, ?, ?)
        `;
            db.query(query, [user_id,email, hashedPassword, profile_name, date_of_birth, gender], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                jwtGenerator(email,res);
                res.status(201).redirect('/');
                
            });
        } catch (error) {
            console.error('Error during signup:', error.message);
            res.status(500).json({ message: 'Something went wrong' });
        }
    });
}

const logIn = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    db.query(query, async (err, result) => {
        if (err) {
            console.error('Error checking for existing user:', err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        jwtGenerator(email, res);
        res.redirect('/');
    });
}
const checkLogins = (req,res)=>{
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message:"User not logged in"});
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:"User not logged in"});
        }
        res.status(200).json({message:"User logged in"});
    });
}

const logout = (req,res)=>{
    res.cookie('jwt','',{maxAge:1});
    res.redirect('/');
}

module.exports = { signUp, logIn , checkLogins,logout};