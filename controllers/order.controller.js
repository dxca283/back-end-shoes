import connectToDatabase from "../database/db_connection.js";
import { decreaseProdSizeStock } from "./product.controller.js"; // tái sử dụng hàm update stock

export const createOrder = async (req, res) => {
  const db = await connectToDatabase();
  const connection = db;

  const user_id = req.user.id;
  const { items } = req.body;
  // items: [{ product_id, size_id, quantity, price }]

  if (!user_id || !items || items.length === 0) {
    return res.status(400).json({ message: "Thiếu dữ liệu đơn hàng" });
  }

  try {
    await connection.beginTransaction();

    // Tính tổng tiền
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 1. Tạo order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [user_id, totalAmount, "pending"]
    );

    const orderId = orderResult.insertId;

    // 2. Tạo order_items + trừ stock
    for (const item of items) {
      // kiểm tra và trừ stock (nên truyền connection để đảm bảo transaction)
      const stockUpdate = await decreaseProdSizeStock(
        item.product_id,
        item.size_id,
        item.quantity
      );

      if (!stockUpdate.success) {
        throw new Error(stockUpdate.message);
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, size_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.size_id, item.quantity, item.price]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: {
        id: orderId,
        user_id,
        total_amount: totalAmount,
        status: "pending",
        items,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    // Lấy order
    const [orderRows] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1",
      [id, req.user.id]
    );
    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Lấy order_items
    const [items] = await db.query(
      `SELECT oi.*, p.name AS product_name, s.size_label
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN sizes s ON oi.size_id = s.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ ...orderRows[0], items });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};
