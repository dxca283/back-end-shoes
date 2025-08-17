import { Router } from "express";
import { getUserById, getUsers } from "../controllers/user.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";


const userRouter = Router();


userRouter.get('/', authorize ,getUsers);
userRouter.get('/:id', authorize ,getUserById);


export default userRouter;