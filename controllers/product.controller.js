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

// Product images
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


//Product Sizes
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

export const decreaseProdSizeStock = async (product_id, size_id, quantity = 1) => {
  try {
    const db = await connectToDatabase();

    // Kiểm tra stock hiện tại
    const [rows] = await db.query(
      "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_id = ?",
      [product_id, size_id]
    );

    if (rows.length === 0) {
      throw new Error("Size không tồn tại cho sản phẩm này");
    }

    if (rows[0].stock_quantity < quantity) {
      throw new Error("Không đủ hàng trong kho");
    }

    // Trừ số lượng
    await db.query(
      `UPDATE product_sizes 
       SET stock_quantity = stock_quantity - ? 
       WHERE product_id = ? AND size_id = ?`,
      [quantity, product_id, size_id]
    );

    return { success: true, message: "Đã trừ stock" };
  } catch (error) {
    console.error("Error decreasing stock:", error);
    return { success: false, message: error.message };
  }
};
