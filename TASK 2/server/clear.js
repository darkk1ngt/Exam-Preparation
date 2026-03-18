import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), 'src/.env') });

import { initializeConnection, query } from './src/database/connection.js';

await initializeConnection();

await query('SET FOREIGN_KEY_CHECKS = 0');
await query('TRUNCATE TABLE order_items');
await query('TRUNCATE TABLE orders');
await query('TRUNCATE TABLE notifications');
await query('TRUNCATE TABLE cart_items');
await query('TRUNCATE TABLE loyalty');
await query('TRUNCATE TABLE products');
await query('TRUNCATE TABLE collection_slots');
await query('TRUNCATE TABLE users');
await query('SET FOREIGN_KEY_CHECKS = 1');

console.log('All tables cleared. Restart the server to re-seed.');
process.exit(0);
