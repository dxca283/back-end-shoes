import { Router } from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";
import { createCategory, getCategories } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post('/', authorize, authorizeRole(['admin', 'staff']), createCategory);
categoryRouter.get('/', authorize, authorizeRole(['admin', 'staff']), getCategories);


export default categoryRouter;