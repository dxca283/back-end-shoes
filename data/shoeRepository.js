import { pool } from './mysqlClient.js';
import { randomUUID } from 'crypto';

function mapRowToShoe(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    size: row.size,
    color: row.color,
    price: row.price,
    stock: row.stock,
    description: row.description,
    category: row.category,
    sku: row.sku,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: [],
  };
}

export async function listShoesRepo(filters) {
  const where = [];
  const params = [];
  const { brand, category, color, minPrice, maxPrice, q } = filters || {};

  if (brand) { where.push('brand = ?'); params.push(String(brand)); }
  if (category) { where.push('category = ?'); params.push(String(category)); }
  if (color) { where.push('color = ?'); params.push(String(color)); }
  if (minPrice != null) { where.push('price >= ?'); params.push(Number(minPrice)); }
  if (maxPrice != null) { where.push('price <= ?'); params.push(Number(maxPrice)); }
  if (q) { where.push('(name LIKE ? OR brand LIKE ? OR description LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT id, name, brand, size, color, price, stock, description, category, sku, created_at, updated_at
     FROM shoes ${whereClause}
     ORDER BY created_at DESC`,
    params
  );

  const shoes = rows.map(mapRowToShoe);
  if (shoes.length === 0) return [];

  const ids = shoes.map(s => s.id);
  const [imgRows] = await pool.query(
    `SELECT shoe_id, url FROM shoe_images WHERE shoe_id IN (${ids.map(() => '?').join(',')})`,
    ids
  );
  const imagesById = new Map();
  for (const r of imgRows) {
    if (!imagesById.has(r.shoe_id)) imagesById.set(r.shoe_id, []);
    imagesById.get(r.shoe_id).push(r.url);
  }
  for (const s of shoes) {
    s.images = imagesById.get(s.id) || [];
  }
  return shoes;
}

export async function createShoeRepo(input) {
  const id = randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const now = new Date();
    await conn.query(
      `INSERT INTO shoes (id, name, brand, size, color, price, stock, description, category, sku, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.name, input.brand, input.size, input.color ?? null, input.price, input.stock, input.description ?? null, input.category ?? null, input.sku ?? null, now, now]
    );

    if (Array.isArray(input.images) && input.images.length > 0) {
      const values = input.images.map(url => [randomUUID(), id, url]);
      await conn.query(
        `INSERT INTO shoe_images (id, shoe_id, url) VALUES ${values.map(() => '(?, ?, ?)').join(',')}`,
        values.flat()
      );
    }

    await conn.commit();

    return await getShoeByIdRepo(id);
  } catch (err) {
    try { await conn.rollback(); } catch {}
    throw err;
  } finally {
    conn.release();
  }
}

export async function getShoeByIdRepo(id) {
  const [rows] = await pool.query(
    `SELECT id, name, brand, size, color, price, stock, description, category, sku, created_at, updated_at FROM shoes WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  const shoe = mapRowToShoe(rows[0]);
  const [imgRows] = await pool.query(`SELECT url FROM shoe_images WHERE shoe_id = ? ORDER BY created_at ASC`, [id]);
  shoe.images = imgRows.map(r => r.url);
  return shoe;
}

export async function updateShoeRepo(id, updates) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const sets = [];
    const params = [];
    const fields = ['name','brand','size','color','price','stock','description','category','sku'];
    for (const f of fields) {
      if (updates[f] !== undefined) {
        sets.push(`${f} = ?`);
        params.push(updates[f]);
      }
    }
    if (sets.length > 0) {
      sets.push('updated_at = ?');
      params.push(new Date());
      params.push(id);
      await conn.query(`UPDATE shoes SET ${sets.join(', ')} WHERE id = ?`, params);
    }

    if (updates.images !== undefined) {
      await conn.query(`DELETE FROM shoe_images WHERE shoe_id = ?`, [id]);
      if (Array.isArray(updates.images) && updates.images.length > 0) {
        const values = updates.images.map(url => [randomUUID(), id, url]);
        await conn.query(
          `INSERT INTO shoe_images (id, shoe_id, url) VALUES ${values.map(() => '(?, ?, ?)').join(',')}`,
          values.flat()
        );
      }
    }

    await conn.commit();
    return await getShoeByIdRepo(id);
  } catch (err) {
    try { await conn.rollback(); } catch {}
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteShoeRepo(id) {
  const [res] = await pool.query(`DELETE FROM shoes WHERE id = ?`, [id]);
  return res.affectedRows > 0;
}