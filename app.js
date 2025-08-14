import express from 'express';
import { PORT } from './config/env.js';
import trainersRouter from './src/routes/trainers.js';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/trainers', trainersRouter);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});