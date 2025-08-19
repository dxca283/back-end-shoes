import { Router } from "express";
import { getUserById, getUsers } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRoles.middleware.js";


const userRouter = Router();


userRouter.get('/', authorize, authorizeRole(['admin']), getUsers);
userRouter.get('/:id', authorize, authorizeRole(['admin']), getUserById);


export default userRouter;