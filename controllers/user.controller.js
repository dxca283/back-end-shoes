import db from "../database/db_connection.js";


export const getUsers = (req, res) => {
  // Logic to get all users
  try {
    db.query(
      `SELECT id, username, full_name, email, phone, address, role, created_at 
       FROM users`,
      (error, results) => {
        if (error) {
          console.error("Error fetching users:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = (req, res) => {
  // Logic to get a user by ID
};
