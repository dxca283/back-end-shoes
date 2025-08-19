import connectToDatabase from "../database/db_connection.js";
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }
    const db = await connectToDatabase();
    const [result] = await db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description]
    );

    res
      .status(201)
      .json({
        message: "Category created successfully",
        categoryId: result.insertId,
        name,
        description
      });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getCategories = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [categories] = await db.query("SELECT name FROM categories");

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
