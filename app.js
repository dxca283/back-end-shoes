import express from 'express';
import { PORT } from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});