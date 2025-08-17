import { Router } from "express";
import { signIn, signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

//Sign up route
authRouter.post('/sign-up', signUp);

//Sign in route
authRouter.post('/sign-in', signIn);


export default authRouter;