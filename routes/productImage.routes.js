import { Router } from "express";
import { addProductImages, deleteProductImage } from "../controllers/prodImage.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
const prodImageRouter = Router();

prodImageRouter.post('/:productId/images', authorize, authorizeRole(['admin', 'staff']), addProductImages);
prodImageRouter.delete('/:productId/images/:imageId', authorize, authorizeRole(['admin', 'staff']), deleteProductImage);

export default prodImageRouter;