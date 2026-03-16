import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export async function initializeDatabase(){
    try{
        const schemaPath = path.join(process.cwd(),'src','database','schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
        const dbName = process.env.DB_NAME;

        if( !dbName || !/^[a-zA-Z0-9_]+$/.test(dbName) ){
            throw new Error('Invalid or missing DB_NAME for schema initialization.');
        }

        const schemaForRuntimeDb = schemaSQL
            .replace(
                /CREATE DATABASE IF NOT EXISTS\s+[`\"]?[a-zA-Z0-9_]+[`\"]?\s+CHARACTER SET/,
                `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET`
            )
            .replace(
                /USE\s+[`\"]?[a-zA-Z0-9_]+[`\"]?\s*;/,
                `USE ${dbName};`
            );

        // First, create database without selecting it
        let connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        // Execute the entire schema SQL at once (includes USE statement)
        await connection.query(schemaForRuntimeDb);

        const migrationStatements = [
            `ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'producer', 'admin') DEFAULT 'customer'`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS farm_name VARCHAR(150) NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20) NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token CHAR(64) DEFAULT NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP NULL DEFAULT NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token CHAR(64) DEFAULT NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS producer_status ENUM('pending', 'approved', 'rejected') DEFAULT NULL`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
            `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL`,
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS collection_slot_id INT UNSIGNED NULL`,
            `ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0.00`,
            `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS customer_id INT UNSIGNED NULL`,
            `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS product_id INT UNSIGNED NULL`,
            `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS order_id INT UNSIGNED NULL`
        ];

        for( const statement of migrationStatements ){
            await connection.query(statement);
        }

        const [[producerStatusExists]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'producer_status'`,
            [dbName]
        );

        if( Number(producerStatusExists.count) > 0 ){
            await connection.query(
                `ALTER TABLE users
                 MODIFY COLUMN producer_status ENUM('pending', 'approved', 'rejected') DEFAULT NULL`
            );
        }

                await connection.query(`UPDATE users SET role = 'customer' WHERE role IS NULL OR role = ''`);
                await connection.query(`UPDATE users SET role = 'admin' WHERE role = 'customer' AND email = 'admin@glh.co.uk'`);
                await connection.query(
                        `UPDATE users
                         SET role = 'producer'
                         WHERE role = 'customer'
                             AND email IN (
                                 'greenacre@glh.co.uk',
                                 'hillsidedairy@glh.co.uk',
                                 'orchardhouse@glh.co.uk',
                                 'rivermeadow@glh.co.uk',
                                 'sunsetfields@glh.co.uk',
                                 'brookside@glh.co.uk',
                                 'meadowview@glh.co.uk',
                                 'theoldmill@glh.co.uk'
                             )`
                );
                await connection.query(
                        `UPDATE users
                         SET producer_status = 'approved', email_verified = TRUE
                         WHERE role = 'producer'`
                );

        const [[legacyUserIdExists]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ?
               AND TABLE_NAME = 'notifications'
               AND COLUMN_NAME = 'user_id'`,
            [dbName]
        );

        if( Number(legacyUserIdExists.count) > 0 ){
            await connection.query(
                `UPDATE notifications
                 SET customer_id = user_id
                 WHERE customer_id IS NULL AND user_id IS NOT NULL`
            );
        }

        const [[ordersSlotFk]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'
               AND CONSTRAINT_NAME = 'fk_orders_collection_slot'`,
            [dbName]
        );

        if( Number(ordersSlotFk.count) === 0 ){
            await connection.query(`
                ALTER TABLE orders
                ADD CONSTRAINT fk_orders_collection_slot
                FOREIGN KEY (collection_slot_id) REFERENCES collection_slots(id) ON DELETE SET NULL
            `);
        }

        const [[notificationsProductFk]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
               AND CONSTRAINT_NAME = 'fk_notifications_product'`,
            [dbName]
        );

        if( Number(notificationsProductFk.count) === 0 ){
            await connection.query(`
                ALTER TABLE notifications
                ADD CONSTRAINT fk_notifications_product
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            `);
        }

        const [[notificationsOrderFk]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
               AND CONSTRAINT_NAME = 'fk_notifications_order'`,
            [dbName]
        );

        if( Number(notificationsOrderFk.count) === 0 ){
            await connection.query(`
                ALTER TABLE notifications
                ADD CONSTRAINT fk_notifications_order
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
            `);
        }

        const [[notificationsCustomerFk]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
               AND CONSTRAINT_NAME = 'fk_notifications_customer'`,
            [dbName]
        );

        if( Number(notificationsCustomerFk.count) === 0 ){
            await connection.query(`
                ALTER TABLE notifications
                ADD CONSTRAINT fk_notifications_customer
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            `);
        }

        const [[notificationsIndex]] = await connection.query(
            `SELECT COUNT(*) AS count
             FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = ?
               AND TABLE_NAME = 'notifications'
               AND INDEX_NAME = 'idx_customer_read'`,
            [dbName]
        );

        if( Number(notificationsIndex.count) === 0 ){
            await connection.query(
                `CREATE INDEX idx_customer_read ON notifications(customer_id, is_read)`
            );
        }

        await connection.end();
        
        console.log(chalk.bold.cyan(`Database schema initialized successfully.`));        
    }catch( error ){
        console.error(chalk.red(`Database initialization failed : ${error.message}`));
        throw error;
    }
}