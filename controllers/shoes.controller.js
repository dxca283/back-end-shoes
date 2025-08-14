import { randomUUID } from 'crypto';
import { prisma } from '../data/prismaClient.js';

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

    const where = {};
    if (brand) where.brand = { equals: String(brand), mode: 'insensitive' };
    if (category) where.category = { equals: String(category), mode: 'insensitive' };
    if (color) where.color = { equals: String(color), mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && Number.isFinite(Number(minPrice))) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined && Number.isFinite(Number(maxPrice))) where.price.lte = Number(maxPrice);
    }
    if (q) {
      const needle = String(q);
      where.OR = [
        { name: { contains: needle, mode: 'insensitive' } },
        { brand: { contains: needle, mode: 'insensitive' } },
        { description: { contains: needle, mode: 'insensitive' } }
      ];
    }

    const shoes = await prisma.shoe.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = shoes.map(s => ({
      ...s,
      images: s.images.map(i => i.url)
    }));

    res.status(200).json({ data: mapped });
  } catch (err) { next(err); }
};

export const createShoe = async (req, res, next) => {
  try {
    const errors = validateShoePayload(req.body, { requireAllFields: true });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const id = randomUUID();
    const created = await prisma.shoe.create({
      data: {
        id,
        name: req.body.name.trim(),
        brand: req.body.brand.trim(),
        size: req.body.size,
        color: req.body.color ?? null,
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description ?? null,
        category: req.body.category ?? null,
        sku: req.body.sku ?? null,
        images: {
          create: Array.isArray(req.body.images) ? req.body.images.map(url => ({ url })) : []
        }
      },
      include: { images: true }
    });

    res.status(201).json({ data: { ...created, images: created.images.map(i => i.url) } });
  } catch (err) { next(err); }
};

export const getShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shoe = await prisma.shoe.findUnique({ where: { id }, include: { images: true } });
    if (!shoe) {
      return res.status(404).json({ error: 'Shoe not found' });
    }
    res.status(200).json({ data: { ...shoe, images: shoe.images.map(i => i.url) } });
  } catch (err) { next(err); }
};

export const updateShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.shoe.findUnique({ where: { id }, include: { images: true } });
    if (!existing) {
      return res.status(404).json({ error: 'Shoe not found' });
    }

    const errors = validateShoePayload(req.body, { requireAllFields: false });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updateData = {
      name: req.body.name !== undefined ? String(req.body.name).trim() : undefined,
      brand: req.body.brand !== undefined ? String(req.body.brand).trim() : undefined,
      size: req.body.size !== undefined ? req.body.size : undefined,
      color: req.body.color !== undefined ? req.body.color : undefined,
      price: req.body.price !== undefined ? req.body.price : undefined,
      stock: req.body.stock !== undefined ? req.body.stock : undefined,
      description: req.body.description !== undefined ? req.body.description : undefined,
      category: req.body.category !== undefined ? req.body.category : undefined,
      sku: req.body.sku !== undefined ? req.body.sku : undefined,
    };

    const updated = await prisma.shoe.update({
      where: { id },
      data: updateData,
      include: { images: true }
    });

    if (req.body.images !== undefined) {
      await prisma.shoeImage.deleteMany({ where: { shoeId: id } });
      if (Array.isArray(req.body.images) && req.body.images.length > 0) {
        await prisma.shoeImage.createMany({ data: req.body.images.map(url => ({ url, shoeId: id })) });
      }
    }

    const finalShoe = await prisma.shoe.findUnique({ where: { id }, include: { images: true } });

    res.status(200).json({ data: { ...finalShoe, images: finalShoe.images.map(i => i.url) } });
  } catch (err) { next(err); }
};

export const deleteShoe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.shoe.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Shoe not found' });
    }
    await prisma.shoe.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
};