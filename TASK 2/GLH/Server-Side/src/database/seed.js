import bcrypt from 'bcrypt';
import { query } from './connection.js';

const SALT_ROUNDS = 10;

 export default async function seed() {

  console.log('Seeding database...');

  // ── 1. ADMIN ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);

  await query(
    `INSERT INTO users (email, password_hash, role, email_verified)
     VALUES ('admin@glh.co.uk', ?, 'admin', TRUE)
     ON DUPLICATE KEY UPDATE role = VALUES(role), email_verified = VALUES(email_verified)`,
    [adminHash],
  );

  console.log('✔ Admin seeded');

  // ── 2. PRODUCERS ────────────────────────────────────────────────────────
  const producerHash = await bcrypt.hash('Producer123!', SALT_ROUNDS);

  const producers = [
    { email: 'greenacre@glh.co.uk',     farm: 'Green Acre Farm',    contact: '07700900001' },
    { email: 'hillsidedairy@glh.co.uk', farm: 'Hillside Dairy',     contact: '07700900002' },
    { email: 'orchardhouse@glh.co.uk',  farm: 'Orchard House Farm', contact: '07700900003' },
    { email: 'rivermeadow@glh.co.uk',   farm: 'River Meadow Farm',  contact: '07700900004' },
    { email: 'sunsetfields@glh.co.uk',  farm: 'Sunset Fields',      contact: '07700900005' },
    { email: 'brookside@glh.co.uk',     farm: 'Brookside Farm',     contact: '07700900006' },
    { email: 'meadowview@glh.co.uk',    farm: 'Meadow View Farm',   contact: '07700900007' },
    { email: 'theoldmill@glh.co.uk',    farm: 'The Old Mill Farm',  contact: '07700900008' },
  ];

  for (const p of producers) {
    await query(
      `INSERT INTO users
         (email, password_hash, role, farm_name, contact_number,
          email_verified, producer_status)
       VALUES (?, ?, 'producer', ?, ?, TRUE, 'approved')
       ON DUPLICATE KEY UPDATE
         role = 'producer',
         farm_name = VALUES(farm_name),
         contact_number = VALUES(contact_number),
         email_verified = TRUE,
         producer_status = 'approved'`,
      [p.email, producerHash, p.farm, p.contact],
    );
  }

  console.log('✔ Producers seeded');

  // ── 3. PRODUCTS ─────────────────────────────────────────────────────────
  // Fetch producer IDs dynamically — query() returns results directly
  const rows = await query(`
    SELECT id, farm_name FROM users
    WHERE farm_name IS NOT NULL
    ORDER BY id ASC
  `);

  const farmId = {};
  for (const row of rows) {
    farmId[row.farm_name] = row.id;
  }

  const products = [
    // Green Acre Farm — Poultry
    { farm: 'Green Acre Farm',    name: 'Free Range Eggs (12)',    category: 'Poultry',    price: 3.50,  stock: 80,  description: 'Fresh free range eggs from our happy hens, laid daily.'                           },
    { farm: 'Green Acre Farm',    name: 'Whole Chicken',           category: 'Poultry',    price: 8.99,  stock: 30,  description: 'Whole free range chicken, oven ready. Approx 1.5kg.'                            },
    { farm: 'Green Acre Farm',    name: 'Chicken Breast Fillet',   category: 'Poultry',    price: 5.50,  stock: 50,  description: 'Skinless chicken breast fillets, ideal for grilling or pan frying.'             },

    // Hillside Dairy — Dairy
    { farm: 'Hillside Dairy',     name: 'Full Fat Milk (2L)',      category: 'Dairy',      price: 1.80,  stock: 120, description: 'Creamy full fat milk from our grass fed herd. Unhomogenised.'                    },
    { farm: 'Hillside Dairy',     name: 'Mature Cheddar (400g)',   category: 'Dairy',      price: 4.20,  stock: 60,  description: 'Aged 12 months for a sharp, rich flavour. Perfect for cooking or a cheeseboard.' },
    { farm: 'Hillside Dairy',     name: 'Unsalted Butter (250g)',  category: 'Dairy',      price: 2.10,  stock: 90,  description: 'Pure churned butter made from our fresh cream. No additives.'                    },
    { farm: 'Hillside Dairy',     name: 'Natural Yoghurt (500g)',  category: 'Dairy',      price: 1.90,  stock: 70,  description: 'Thick, creamy natural yoghurt with live cultures. No added sugar.'               },

    // Orchard House Farm — Fruit and Drinks
    { farm: 'Orchard House Farm', name: 'Cox Apples (1kg)',        category: 'Fruit',      price: 2.50,  stock: 100, description: 'Sweet and aromatic Cox apples, hand picked from our heritage orchard.'           },
    { farm: 'Orchard House Farm', name: 'Conference Pears (1kg)',  category: 'Fruit',      price: 2.80,  stock: 80,  description: 'Juicy conference pears, perfectly ripened on the tree.'                         },
    { farm: 'Orchard House Farm', name: 'Apple Juice (1L)',        category: 'Drinks',     price: 2.20,  stock: 60,  description: 'Cold pressed apple juice, no added sugar or preservatives.'                     },

    // River Meadow Farm — Meat
    { farm: 'River Meadow Farm',  name: 'Beef Mince (500g)',       category: 'Meat',       price: 5.99,  stock: 40,  description: 'Lean beef mince from our grass fed herd. 10% fat content.'                      },
    { farm: 'River Meadow Farm',  name: 'Ribeye Steak (250g)',     category: 'Meat',       price: 9.50,  stock: 25,  description: 'Aged ribeye steak with excellent marbling. Best cooked medium rare.'             },
    { farm: 'River Meadow Farm',  name: 'Pork Sausages (6pk)',     category: 'Meat',       price: 4.50,  stock: 55,  description: 'Traditional pork sausages with 85% meat content and natural casings.'           },

    // Sunset Fields — Salad and Vegetables
    { farm: 'Sunset Fields',      name: 'Mixed Salad Leaves',      category: 'Vegetables', price: 1.50,  stock: 150, description: 'A seasonal mix of baby leaves, rocket and watercress, harvested daily.'         },
    { farm: 'Sunset Fields',      name: 'Baby Spinach (200g)',     category: 'Vegetables', price: 1.80,  stock: 130, description: 'Tender baby spinach leaves, washed and ready to use.'                          },
    { farm: 'Sunset Fields',      name: 'Cherry Tomatoes (500g)',  category: 'Vegetables', price: 2.20,  stock: 110, description: 'Sweet and juicy cherry tomatoes on the vine, ripened in our polytunnels.'      },
    { farm: 'Sunset Fields',      name: 'Cucumber',                category: 'Vegetables', price: 0.89,  stock: 90,  description: 'Crisp full size cucumber, grown without pesticides.'                           },

    // Brookside Farm — Root Vegetables
    { farm: 'Brookside Farm',     name: 'New Potatoes (1kg)',      category: 'Vegetables', price: 1.60,  stock: 200, description: 'Freshly dug new potatoes with a thin skin. Great boiled or roasted.'            },
    { farm: 'Brookside Farm',     name: 'Carrots (1kg)',           category: 'Vegetables', price: 1.10,  stock: 180, description: 'Unwashed Chantenay carrots, sweet and tender. Pulled fresh to order.'           },
    { farm: 'Brookside Farm',     name: 'White Onions (1kg)',      category: 'Vegetables', price: 1.00,  stock: 160, description: 'Classic white onions, mild in flavour and ideal for cooking.'                   },

    // Meadow View Farm — Pantry and Herbs
    { farm: 'Meadow View Farm',   name: 'Wildflower Honey (340g)', category: 'Pantry',     price: 5.50,  stock: 45,  description: 'Raw wildflower honey from our own hives. Unfiltered and unpasteurised.'        },
    { farm: 'Meadow View Farm',   name: 'Raspberry Jam (340g)',    category: 'Pantry',     price: 3.20,  stock: 60,  description: 'Homemade raspberry jam with whole fruit pieces. No artificial preservatives.'   },
    { farm: 'Meadow View Farm',   name: 'Mixed Herb Bundle',       category: 'Herbs',      price: 1.80,  stock: 80,  description: 'Freshly cut mixed herbs including rosemary, thyme and flat leaf parsley.'       },

    // The Old Mill Farm — Bakery and Pantry
    { farm: 'The Old Mill Farm',  name: 'Wholemeal Bread Loaf',    category: 'Bakery',     price: 2.80,  stock: 50,  description: 'Stone baked wholemeal loaf using our own milled flour. No additives.'           },
    { farm: 'The Old Mill Farm',  name: 'Sourdough Loaf',          category: 'Bakery',     price: 3.50,  stock: 40,  description: 'Traditional sourdough with a crisp crust and open crumb, fermented 24 hours.'   },
    { farm: 'The Old Mill Farm',  name: 'Stoneground Flour (1kg)', category: 'Pantry',     price: 2.00,  stock: 75,  description: 'Stoneground wholemeal flour milled on site from heritage wheat varieties.'      },
  ];

  for (const p of products) {
    const producerId = farmId[p.farm];
    if (!producerId) {
      console.warn(`⚠ No producer found for farm: ${p.farm} — skipping`);
      continue;
    }

    const existingProduct = await query(
      `SELECT id FROM products WHERE producer_id = ? AND name = ? LIMIT 1`,
      [producerId, p.name],
    );

    if (existingProduct.length === 0) {
      await query(
        `INSERT INTO products
           (producer_id, name, description, category, price, stock_quantity, is_available)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [producerId, p.name, p.description, p.category, p.price, p.stock],
      );
    }
  }

  console.log('✔ Products seeded');

  // ── 4. COLLECTION SLOTS ─────────────────────────────────────────────────
  const slots = [
    { date: '2026-03-16', time: '09:00:00' },
    { date: '2026-03-16', time: '11:00:00' },
    { date: '2026-03-16', time: '14:00:00' },
    { date: '2026-03-17', time: '09:00:00' },
    { date: '2026-03-17', time: '11:00:00' },
    { date: '2026-03-17', time: '14:00:00' },
    { date: '2026-03-18', time: '10:00:00' },
    { date: '2026-03-18', time: '13:00:00' },
    { date: '2026-03-19', time: '09:00:00' },
    { date: '2026-03-19', time: '11:00:00' },
    { date: '2026-03-20', time: '10:00:00' },
    { date: '2026-03-20', time: '13:00:00' },
  ];

  for (const s of slots) {
    await query(
      `INSERT INTO collection_slots (slot_date, slot_time, max_capacity)
       VALUES (?, ?, 10)
       ON DUPLICATE KEY UPDATE max_capacity = VALUES(max_capacity)`,
      [s.date, s.time],
    );
  }

  console.log('✔ Collection slots seeded');
  console.log('');
  console.log('Seeding complete.');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:    admin@glh.co.uk          / Admin123!');
  console.log('  Producer: hillsidedairy@glh.co.uk  / Producer123!');
  console.log('  (all 8 producers share the same default password)');
  console.log('  Customers: register through the app normally');
}

