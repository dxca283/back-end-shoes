import { randomUUID } from 'crypto';
import { createShoeRepo, deleteShoeRepo, getShoeByIdRepo, listShoesRepo, updateShoeRepo } from '../data/shoeRepository.js';

function validateShoePayload(payload, { requireAllFields = true } = {}) {
  const errors = [];
  const { name, brand, size, color, price, stock, description, category, images, sku } = payload || {};

  if (requireAllFields || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('name must be a non-empty string');
    }
  }
  if (requireAllFields || brand !== undefined) {
    if (typeof brand !== 'string' || brand.trim().length === 0) {
      errors.push('brand must be a non-empty string');
    }
  }
  if (requireAllFields || size !== undefined) {
    if (typeof size !== 'number' || !Number.isFinite(size)) {
      errors.push('size must be a number');
    }
  }
  if (requireAllFields || price !== undefined) {
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      errors.push('price must be a non-negative number');
    }
  }
  if (requireAllFields || stock !== undefined) {
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      errors.push('stock must be a non-negative integer');
    }
  }
  if (color !== undefined && (typeof color !== 'string' || color.trim().length === 0)) {
    errors.push('color must be a non-empty string when provided');
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string when provided');
  }
  if (category !== undefined && typeof category !== 'string') {
    errors.push('category must be a string when provided');
  }
  if (sku !== undefined && typeof sku !== 'string') {
    errors.push('sku must be a string when provided');
  }
  if (images !== undefined) {
    if (!Array.isArray(images) || images.some(u => typeof u !== 'string')) {
      errors.push('images must be an array of strings when provided');
    }
  }

  return errors;
}

export const listShoes = async (req, res, next) => {
  try {
    const { brand, category, color, minPrice, maxPrice, q } = req.query;
    const data = await listShoesRepo({ brand, category, color, minPrice, maxPrice, q });
    res.status(200).json({ data });
  } catch (err) { next(err); }
};

export const createShoe = async (req, res, next) => {
  try {
    const errors = validateShoePayload(req.body, { requireAllFields: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const created = await createShoeRepo({
      name: req.body.name.trim(),
      brand: req.body.brand.trim(),
      size: req.body.size,
      color: req.body.color ?? null,
      price: req.body.price,
      stock: req.body.stock,
      description: req.body.description ?? null,
      category: req.body.category ?? null,
      sku: req.body.sku ?? null,
      images: Array.isArray(req.body.images) ? req.body.images : [],
    });

    res.status(201).json({ data: created });
  } catch (err) { next(err); }
};

export const getShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shoe = await getShoeByIdRepo(id);
    if (!shoe) {
      return res.status(404).json({ error: 'Shoe not found' });
    }
    res.status(200).json({ data: shoe });
  } catch (err) { next(err); }
};

export const updateShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getShoeByIdRepo(id);
    if (!existing) {
      return res.status(404).json({ error: 'Shoe not found' });
    }

    const errors = validateShoePayload(req.body, { requireAllFields: false });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updated = await updateShoeRepo(id, req.body);
    res.status(200).json({ data: updated });
  } catch (err) { next(err); }
};

export const deleteShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ok = await deleteShoeRepo(id);
    if (!ok) {
      return res.status(404).json({ error: 'Shoe not found' });
    }
    res.status(204).send();
  } catch (err) { next(err); }
};