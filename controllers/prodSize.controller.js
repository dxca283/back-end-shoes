import connectToDatabase from "../database/db_connection.js";

export const addProdSizes = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size_id, stock_quantity } = req.body;

    if (!size_id || !stock_quantity) {
      return res
        .status(400)
        .json({ message: "Size ID and stock quantity are required." });
    }

    const db = await connectToDatabase();
    const [productRows] = await db.query(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    const [sizeRows] = await db.query(
      "SELECT id FROM sizes WHERE id = ? LIMIT 1",
      [size_id]
    );
    if (sizeRows.length === 0) {
      return res.status(404).json({ message: "Size not found." });
    }

    const [result] = await db.query(
      "INSERT INTO product_sizes (product_id, size_id, stock_quantity) VALUES (?, ?, ?)",
      [productId, size_id, stock_quantity]
    );

    res.status(201).json({
        message: "Product size added successfully.",
        size: {
            id: result.insertId,
            product_id: productId,
            size_id: size_id,
            stock_quantity: stock_quantity
        }
    });
  } catch (error) {
    console.error("Error adding product sizes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProdSize = async (req, res) => {
  try {
    const { sizeId } = req.params;

    const db = await connectToDatabase();

    const [rows] = await db.query(
      "SELECT id FROM product_sizes WHERE id = ? LIMIT 1",
      [sizeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product size not found" });
    }

    await db.query("DELETE FROM product_sizes WHERE id = ?", [sizeId]);

    res.status(200).json({ message: "Product size deleted successfully" });
  } catch (error) {
    console.error("Error deleting product size:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateProdSize = async (req, res) => {
  try {
    const { product_id, size_id, stock_quantity } = req.body;

    if (!product_id || !size_id || stock_quantity === undefined) {
      return res.status(400).json({ message: "product_id, size_id và stock_quantity là bắt buộc" });
    }

    const db = await connectToDatabase();

    const [result] = await db.query(
      `UPDATE product_sizes 
       SET stock_quantity = ? 
       WHERE product_id = ? AND size_id = ?`,
      [stock_quantity, product_id, size_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy size cho sản phẩm này" });
    }

    res.status(200).json({
      message: "Cập nhật stock thành công",
      product_id,
      size_id,
      stock_quantity,
    });
  } catch (error) {
    console.error("Error updating product size:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

