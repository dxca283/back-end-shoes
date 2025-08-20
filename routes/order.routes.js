import { Router } from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
import { createOrder, getOrderById, getOrders } from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.post('/', authorize, authorizeRole(['admin', 'staff']), createOrder);
orderRouter.get('/', authorize, authorizeRole(['admin', 'staff']), getOrders);
orderRouter.get('/:id', authorize, authorizeRole(['admin', 'staff']), getOrderById);


export default orderRouter;