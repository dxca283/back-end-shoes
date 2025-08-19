import { Router } from "express";
import { addProdSizes, deleteProdSize, updateProdSize } from "../controllers/prodSize.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
const prodSizeRouter = Router();

prodSizeRouter.post('/:productId/sizes', authorize, authorizeRole(['admin', 'staff']), addProdSizes);
prodSizeRouter.delete('/:productId/sizes/:sizeId', authorize, authorizeRole(['admin', 'staff']), deleteProdSize);
prodSizeRouter.put('/:productId/sizes/:sizeId', authorize, authorizeRole(['admin', 'staff']), updateProdSize);


export default prodSizeRouter;