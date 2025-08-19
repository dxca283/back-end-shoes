import connectToDatabase from "../database/db_connection.js";

export const getUsers = async (req, res) => {
  try {
    
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT id, username, full_name, email, phone, address, role, created_at 
       FROM users`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    
    const { id } = req.params;
    const db = await connectToDatabase();

    const [rows] = await db.query(
      `SELECT id, username, full_name, email, phone, address, role, created_at
       FROM users 
       WHERE id = ? 
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
