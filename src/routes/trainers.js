import { Router } from 'express';
import prisma from '../db/prisma.js';

const router = Router();

// Create trainer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, specialty, isActive } = req.body;
    const trainer = await prisma.trainer.create({
      data: { name, email, phone, specialty, isActive }
    });
    res.status(201).json(trainer);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to create trainer' });
  }
});

// Get all trainers
router.get('/', async (_req, res) => {
  try {
    const trainers = await prisma.trainer.findMany({ orderBy: { id: 'asc' } });
    res.json(trainers);
  } catch (_error) {
    res.status(500).json({ message: 'Failed to fetch trainers' });
  }
});

// Get trainer by id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const trainer = await prisma.trainer.findUnique({ where: { id } });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json(trainer);
  } catch (_error) {
    res.status(500).json({ message: 'Failed to fetch trainer' });
  }
});

// Update trainer
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, specialty, isActive } = req.body;
    const trainer = await prisma.trainer.update({
      where: { id },
      data: { name, email, phone, specialty, isActive }
    });
    res.json(trainer);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to update trainer' });
  }
});

// Delete trainer
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.trainer.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.status(500).json({ message: 'Failed to delete trainer' });
  }
});

export default router;