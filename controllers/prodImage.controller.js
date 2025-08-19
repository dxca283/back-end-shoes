import connectToDatabase from "../database/db_connection.js";

export const addProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({ message: "Image URL is required" });
    }
    const db = await connectToDatabase();

    const [productRows] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [result] = await db.query(
      "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
      [productId, image_url]
    );

    res.status(201).json({
      message: "Product image added successfully",
      image: {
        id: result.insertId,
        product_id: productId,
        image_url: image_url,
      },
    });
  } catch (error) {
    console.error("Error adding product images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const {imageId} = req.params;
    const db = await connectToDatabase();

    const [result] = await db.query(
      "DELETE id FROM product_images WHERE id = ? LIMIT 1",
      [imageId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Image not found" });
    }
    await db.query("DELETE FROM product_images WHERE id = ?", [imageId]);

    res.status(200).json({ message: "Product image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
