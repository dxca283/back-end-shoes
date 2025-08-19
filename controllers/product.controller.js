import connectToDatabase from "../database/db_connection.js";

export const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, images, sizes } = req.body;
    if (!category_id || !name || !price) {
      return res
        .status(400)
        .json({ message: "Category ID, name, and price are required" });
    }
    const db = await connectToDatabase();

    const [categoryRows] = await db.query(
      "SELECT id FROM categories WHERE id = ? LIMIT 1",
      [category_id]
    );

    if (categoryRows.length === 0) {
      return res.status(400).json({ message: "Category không tồn tại" });
    }
    const [result] = await db.query(
      `INSERT INTO products (category_id, name, description, price) 
         VALUES (?, ?, ?, ?)`,
      [category_id, name, description || null, price]
    );

    const productId = result.insertId;
    if (images && images.length > 0) {
      const values = images.map((img) => [productId, img]);
      await db.query(
        "INSERT INTO product_images (product_id, image_url) VALUES ?",
        [values]
      );
    }

    if (sizes && sizes.length > 0) {
      const values = sizes.map((s) => [productId, s.size_id, s.stock_quantity]);
      await db.query(
        "INSERT INTO product_sizes (product_id, size_id, stock_quantity) VALUES ?",
        [values]
      );
    }
    res.status(201).json({
      message: "Product created successfully",
      product: {
        id: productId,
        category_id,
        name,
        description,
        price,
        images,
        sizes,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      `SELECT 
         p.id AS product_id,
         p.name AS product_name,
         p.description AS product_description,
         p.price,
         p.created_at,
         c.id AS category_id,
         c.name AS category_name,
         c.description AS category_description
       FROM products p
       JOIN categories c ON p.category_id = c.id`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();
    const [rows] = await db.query(
      `SELECT 
         p.id AS product_id,
         p.name AS product_name,
         p.description AS product_description,
         p.price,
         p.created_at,
         c.id AS category_id,
         c.name AS category_name,
         c.description AS category_description
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
