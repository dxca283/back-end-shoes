import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import connectToDatabase from "../database/db_connection.js";

export const signUp = async (req, res) => {
  const { username, password, full_name, email, phone, address, role } =
    req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await connectToDatabase();

    const [result] = await db.query(
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
        role || "customer",
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT id, username, role, password_hash 
       FROM users 
       WHERE username = ? 
       LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: "Sign-in successful",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
