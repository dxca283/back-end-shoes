import { Router } from "express";
import {createProduct, getProductById, getProducts} from "../controllers/product.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
const productRouter = Router();

// Placeholder for product routes
productRouter.get('/', authorize, authorizeRole(['admin', 'staff']), getProducts);
productRouter.get('/:id', authorize, authorizeRole(['admin', 'staff']), getProductById);
productRouter.post('/', authorize, authorizeRole(['admin', 'staff']), createProduct);



export default productRouter;