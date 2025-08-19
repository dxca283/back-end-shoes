import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import connectToDatabase from "../database/db_connection.js";

export const authorize = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Kết nối DB
    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT id, username, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error("Authorize error:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};
