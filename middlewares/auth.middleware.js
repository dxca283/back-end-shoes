import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import db from "../database/db_connection.js";

export const authorize = (req, res, next) => {
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

    db.query(
      "SELECT id, username, role FROM users WHERE id = ? LIMIT 1",
      [userId],
      (err, results) => {
        if (err) {
          console.error("DB error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
          return res
            .status(401)
            .json({ message: "Unauthorized: User not found" });
        }

        req.user = results[0]; 
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};
