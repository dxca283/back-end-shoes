import { Router } from 'express';
import { listShoes, createShoe, getShoe, updateShoe, deleteShoe } from '../controllers/shoes.controller.js';

const router = Router();

router.get('/', listShoes);
router.post('/', createShoe);
router.get('/:id', getShoe);
router.put('/:id', updateShoe);
router.patch('/:id', updateShoe);
router.delete('/:id', deleteShoe);

export default router;