import mysql from 'mysql2/promise';
import { DATABASE_URL, NODE_ENV } from '../config/env.js';

if (!DATABASE_URL) {
  console.warn('[mysql] DATABASE_URL is not set. Set it in your env file.');
}

export const pool = mysql.createPool(DATABASE_URL || 'mysql://root:password@localhost:3306/shoesdb', {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  supportBigNumbers: true,
  bigNumberStrings: false,
  // Enable namedPlaceholders if you prefer; sticking to positional for clarity.
});