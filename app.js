import express from 'express';
import { PORT } from './config/env.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import connectToDatabase from './database/db_connection.js';
import productRouter from './routes/product.routes.js';
import categoryRouter from './routes/category.routes.js';
import orderRouter from './routes/order.routes.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(arcjetMiddleware);



app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/orders', orderRouter);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectToDatabase();
});