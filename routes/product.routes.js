import { Router } from "express";
import {addProdSizes, addProductImages, createProduct, deleteProdSize, deleteProductImage, getProductById, getProducts, updateProdSize} from "../controllers/product.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
const productRouter = Router();

// Placeholder for product routes
productRouter.get('/', authorize, authorizeRole(['admin', 'staff']), getProducts);
productRouter.get('/:id', authorize, authorizeRole(['admin', 'staff']), getProductById);
productRouter.post('/', authorize, authorizeRole(['admin', 'staff']), createProduct);

// Product Images
productRouter.post("/:id/images", authorize, authorizeRole(["admin", "staff"]), addProductImages);
productRouter.delete("/:id/images/:imageId", authorize, authorizeRole(["admin", "staff"]), deleteProductImage);

// Product Sizes
productRouter.post("/:id/sizes", authorize, authorizeRole(["admin", "staff"]), addProdSizes);
productRouter.put("/:id/sizes/:sizeId", authorize, authorizeRole(["admin", "staff"]), updateProdSize);
productRouter.delete("/:id/sizes/:sizeId", authorize, authorizeRole(["admin", "staff"]), deleteProdSize);

export default productRouter;