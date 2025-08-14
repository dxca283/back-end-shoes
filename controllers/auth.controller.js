import bcrypt from 'bcrypt';
import db from '../database/db_connection.js';

export const signUp = async (req, res) => {
    const {username, password, full_name, email, phone, address, role} = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            `INSERT INTO users 
            (username, password_hash, full_name, email, phone, address, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                hashedPassword,
                full_name || null,
                email || null,
                phone || null,
                address || null,
                role || 'customer'
            ],
            (error, results) => {
                if (error) {
                    console.error('Error during sign-up:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.status(201).json({ message: 'User created successfully', userId: results.insertId });
            }
        )
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
