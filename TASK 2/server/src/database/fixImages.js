import { query } from './connection.js';

/**
 * One-off script to fix product images if database was already seeded
 * Updates Beef Mince and Ribeye Steak image URLs
 */
async function fixImages() {
  try {
    console.log('Fixing product images...');

    // Update Beef Mince
    await query(
      `UPDATE products SET image_url = ? WHERE name = ?`,
      ['https://images.unsplash.com/photo-1555939594-58d7cb561759?w=320&h=200&fit=crop&auto=format', 'Beef Mince (500g)']
    );
    console.log('✔ Updated Beef Mince image');

    // Update Ribeye Steak
    await query(
      `UPDATE products SET image_url = ? WHERE name = ?`,
      ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=320&h=200&fit=crop&auto=format', 'Ribeye Steak (250g)']
    );
    console.log('✔ Updated Ribeye Steak image');

    console.log('Image fixes applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing images:', error);
    process.exit(1);
  }
}

fixImages();
