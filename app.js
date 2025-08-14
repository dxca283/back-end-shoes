import express from 'express';
import { PORT } from './config/env.js';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});