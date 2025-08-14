import { randomUUID } from 'crypto';
import { createShoeRecord, deleteShoeById, getAllShoes, getShoeById, updateShoeById } from '../data/shoeStore.js';

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

export const listShoes = (req, res) => {
  const { brand, category, color, minPrice, maxPrice, q } = req.query;
  let results = getAllShoes();

  if (brand) {
    results = results.filter(s => s.brand.toLowerCase() === String(brand).toLowerCase());
  }
  if (category) {
    results = results.filter(s => (s.category || '').toLowerCase() === String(category).toLowerCase());
  }
  if (color) {
    results = results.filter(s => (s.color || '').toLowerCase() === String(color).toLowerCase());
  }
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    if (Number.isFinite(min)) {
      results = results.filter(s => s.price >= min);
    }
  }
  if (maxPrice !== undefined) {
    const max = Number(maxPrice);
    if (Number.isFinite(max)) {
      results = results.filter(s => s.price <= max);
    }
  }
  if (q) {
    const needle = String(q).toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(needle) ||
      s.brand.toLowerCase().includes(needle) ||
      (s.description || '').toLowerCase().includes(needle)
    );
  }

  res.status(200).json({ data: results });
};

export const createShoe = (req, res) => {
  const errors = validateShoePayload(req.body, { requireAllFields: true });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const shoe = {
    id: randomUUID(),
    name: req.body.name.trim(),
    brand: req.body.brand.trim(),
    size: req.body.size,
    color: req.body.color ?? null,
    price: req.body.price,
    stock: req.body.stock,
    description: req.body.description ?? null,
    category: req.body.category ?? null,
    images: Array.isArray(req.body.images) ? req.body.images : [],
    sku: req.body.sku ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  createShoeRecord(shoe);

  res.status(201).json({ data: shoe });
};

export const getShoe = (req, res) => {
  const { id } = req.params;
  const shoe = getShoeById(id);
  if (!shoe) {
    return res.status(404).json({ error: 'Shoe not found' });
  }
  res.status(200).json({ data: shoe });
};

export const updateShoe = (req, res) => {
  const { id } = req.params;
  const existing = getShoeById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Shoe not found' });
  }

  const errors = validateShoePayload(req.body, { requireAllFields: false });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const updated = {
    ...existing,
    ...req.body,
    name: req.body.name !== undefined ? String(req.body.name).trim() : existing.name,
    brand: req.body.brand !== undefined ? String(req.body.brand).trim() : existing.brand,
    images: req.body.images !== undefined ? (Array.isArray(req.body.images) ? req.body.images : existing.images) : existing.images,
    updatedAt: new Date().toISOString()
  };

  updateShoeById(id, updated);
  res.status(200).json({ data: updated });
};

export const deleteShoe = (req, res) => {
  const { id } = req.params;
  const existing = getShoeById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Shoe not found' });
  }
  deleteShoeById(id);
  res.status(204).send();
};