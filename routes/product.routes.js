import { Router } from "express";

const productRouter = Router();

// Placeholder for product routes
productRouter.get('/', (req, res) => {
  res.status(200).json({ message: "List of products" });
});
productRouter.get('/:id', (req, res) => {
  const { id } = req.params;

  res.status(200).json({ message: `Product details for ID: ${id}` });
});


productRouter.post('/', );


export default productRouter;