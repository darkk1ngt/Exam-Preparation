import bcrypt from 'bcryptjs';
import { query } from './connection.js';

const SALT_ROUNDS = 10;

export default async function seed() {

  // Check if already seeded — skip if admin exists
  const existing = await query(
    `SELECT id FROM users WHERE email = 'admin@glh.co.uk' LIMIT 1`
  );

  if (existing.length > 0) {
    console.log('Database already seeded — skipping');
    return;
  }

  console.log('Seeding database...');

  // ── 1. ADMIN ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);

  await query(`
    INSERT INTO users (email, password_hash, role, email_verified)
    VALUES ('admin@glh.co.uk', ?, 'admin', TRUE)
  `, [adminHash]);

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
    await query(`
      INSERT INTO users
        (email, password_hash, role, farm_name, contact_number,
         email_verified, producer_status)
      VALUES (?, ?, 'producer', ?, ?, TRUE, 'approved')
    `, [p.email, producerHash, p.farm, p.contact]);
  }

  console.log('✔ Producers seeded');

  // ── 3. CUSTOMERS ────────────────────────────────────────────────────────
  const customerHash = await bcrypt.hash('Customer123!', SALT_ROUNDS);

  const customers = [
    { email: 'jamie.kelly@example.com' },
    { email: 's.patel@example.com'     },
    { email: 'r.thompson@example.com'  },
  ];

  const customerIds = [];
  for (const c of customers) {
    const result = await query(`
      INSERT INTO users (email, password_hash, role, email_verified)
      VALUES (?, ?, 'customer', TRUE)
    `, [c.email, customerHash]);
    customerIds.push(result.insertId);
  }

  console.log('✔ Customers seeded');

  // ── 4. PRODUCTS ─────────────────────────────────────────────────────────
  const producerRows = await query(`
    SELECT id, farm_name FROM users WHERE role = 'producer' ORDER BY id ASC
  `);

  const farmId = {};
  for (const row of producerRows) {
    farmId[row.farm_name] = row.id;
  }

  const products = [
    // Green Acre Farm — Poultry
    {
      farm: 'Green Acre Farm', name: 'Free Range Eggs (12)', category: 'Dairy & Eggs',
      price: 3.50, stock: 80,
      description: 'Fresh free range eggs from our happy hens, laid daily.',
      image_url: 'https://images.unsplash.com/photo-1569288052389-dac1519dc3b4?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Green Acre Farm', name: 'Whole Chicken', category: 'Poultry',
      price: 8.99, stock: 30,
      description: 'Whole free range chicken, oven ready. Approx 1.5kg.',
      image_url: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Green Acre Farm', name: 'Chicken Breast Fillets', category: 'Poultry',
      price: 5.50, stock: 50,
      description: 'Skinless chicken breast fillets, ideal for grilling or pan frying.',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d11bbc?w=320&h=200&fit=crop&auto=format',
    },

    // Hillside Dairy — Dairy & Eggs
    {
      farm: 'Hillside Dairy', name: 'Full Fat Milk (2L)', category: 'Dairy & Eggs',
      price: 1.80, stock: 120,
      description: 'Creamy full fat milk from our grass fed herd. Unhomogenised.',
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Hillside Dairy', name: 'Mature Cheddar (400g)', category: 'Dairy & Eggs',
      price: 4.20, stock: 60,
      description: 'Aged 12 months for a sharp, rich flavour. Perfect for cooking or a cheeseboard.',
      image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Hillside Dairy', name: 'Unsalted Butter (250g)', category: 'Dairy & Eggs',
      price: 2.10, stock: 90,
      description: 'Pure churned butter made from our fresh cream. No additives.',
      image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Hillside Dairy', name: 'Natural Yoghurt (500g)', category: 'Dairy & Eggs',
      price: 1.90, stock: 70,
      description: 'Thick, creamy natural yoghurt with live cultures. No added sugar.',
      image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=320&h=200&fit=crop&auto=format',
    },

    // Orchard House Farm — Fruit
    {
      farm: 'Orchard House Farm', name: 'Cox Apples (1kg)', category: 'Fruit',
      price: 2.50, stock: 100,
      description: 'Sweet and aromatic Cox apples, hand picked from our heritage orchard.',
      image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Orchard House Farm', name: 'Conference Pears (1kg)', category: 'Fruit',
      price: 2.80, stock: 80,
      description: 'Juicy conference pears, perfectly ripened on the tree.',
      image_url: 'https://images.unsplash.com/photo-1582980046066-9956abe27a9e?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Orchard House Farm', name: 'Fresh Apple Juice (1L)', category: 'Fruit',
      price: 2.20, stock: 60,
      description: 'Cold pressed apple juice, no added sugar or preservatives.',
      image_url: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=320&h=200&fit=crop&auto=format',
    },

    // River Meadow Farm — Meat
    {
      farm: 'River Meadow Farm', name: 'Beef Mince (500g)', category: 'Meat',
      price: 5.99, stock: 40,
      description: 'Lean beef mince from our grass fed herd. 10% fat content.',
      image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'River Meadow Farm', name: 'Ribeye Steak (250g)', category: 'Meat',
      price: 9.50, stock: 25,
      description: 'Aged ribeye steak with excellent marbling. Best cooked medium rare.',
      image_url: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'River Meadow Farm', name: 'Pork Sausages (6pk)', category: 'Meat',
      price: 4.50, stock: 55,
      description: 'Traditional pork sausages with 85% meat content and natural casings.',
      image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=320&h=200&fit=crop&auto=format',
    },

    // Sunset Fields — Salad & Vegetables
    {
      farm: 'Sunset Fields', name: 'Mixed Salad Leaves', category: 'Vegetables',
      price: 1.50, stock: 150,
      description: 'A seasonal mix of baby leaves, rocket and watercress, harvested daily.',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Sunset Fields', name: 'Baby Spinach (200g)', category: 'Vegetables',
      price: 1.80, stock: 130,
      description: 'Tender baby spinach leaves, washed and ready to use.',
      image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Sunset Fields', name: 'Cherry Tomatoes (500g)', category: 'Vegetables',
      price: 2.20, stock: 110,
      description: 'Sweet and juicy cherry tomatoes on the vine, ripened in our polytunnels.',
      image_url: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Sunset Fields', name: 'Cucumber', category: 'Vegetables',
      price: 0.89, stock: 90,
      description: 'Crisp full size cucumber, grown without pesticides.',
      image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=320&h=200&fit=crop&auto=format',
    },

    // Brookside Farm — Root Vegetables
    {
      farm: 'Brookside Farm', name: 'New Potatoes (1kg)', category: 'Vegetables',
      price: 1.60, stock: 200,
      description: 'Freshly dug new potatoes with a thin skin. Great boiled or roasted.',
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Brookside Farm', name: 'Chantenay Carrots (1kg)', category: 'Vegetables',
      price: 1.10, stock: 180,
      description: 'Unwashed Chantenay carrots, sweet and tender. Pulled fresh to order.',
      image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Brookside Farm', name: 'White Onions (1kg)', category: 'Vegetables',
      price: 1.00, stock: 160,
      description: 'Classic white onions, mild in flavour and ideal for cooking.',
      image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=320&h=200&fit=crop&auto=format',
    },

    // Meadow View Farm — Preserves & Herbs
    {
      farm: 'Meadow View Farm', name: 'Wildflower Honey (340g)', category: 'Preserves',
      price: 5.50, stock: 45,
      description: 'Raw wildflower honey from our own hives. Unfiltered and unpasteurised.',
      image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Meadow View Farm', name: 'Raspberry Jam (340g)', category: 'Preserves',
      price: 3.20, stock: 60,
      description: 'Homemade raspberry jam with whole fruit pieces. No artificial preservatives.',
      image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'Meadow View Farm', name: 'Mixed Herb Bundle', category: 'Herbs',
      price: 1.80, stock: 80,
      description: 'Freshly cut mixed herbs including rosemary, thyme and flat leaf parsley.',
      image_url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=320&h=200&fit=crop&auto=format',
    },

    // The Old Mill Farm — Bakery
    {
      farm: 'The Old Mill Farm', name: 'Wholemeal Bread Loaf', category: 'Bakery',
      price: 2.80, stock: 50,
      description: 'Stone baked wholemeal loaf using our own milled flour. No additives.',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'The Old Mill Farm', name: 'Sourdough Loaf', category: 'Bakery',
      price: 3.50, stock: 40,
      description: 'Traditional sourdough with a crisp crust and open crumb, fermented 24 hours.',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=200&fit=crop&auto=format',
    },
    {
      farm: 'The Old Mill Farm', name: 'Stoneground Flour (1kg)', category: 'Bakery',
      price: 2.00, stock: 75,
      description: 'Stoneground wholemeal flour milled on site from heritage wheat varieties.',
      image_url: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=320&h=200&fit=crop&auto=format',
    },
  ];

  for (const p of products) {
    const producerId = farmId[p.farm];
    if (!producerId) {
      console.warn(`⚠ No producer found for farm: ${p.farm} — skipping`);
      continue;
    }
    await query(`
      INSERT INTO products
        (producer_id, name, description, category, price, stock_quantity, is_available, image_url)
      VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
    `, [producerId, p.name, p.description, p.category, p.price, p.stock, p.image_url]);
  }

  console.log('✔ Products seeded');

  // ── 5. COLLECTION SLOTS ─────────────────────────────────────────────────
  const slots = [
    { date: '2026-03-19', time: '09:00:00' },
    { date: '2026-03-19', time: '11:00:00' },
    { date: '2026-03-19', time: '14:00:00' },
    { date: '2026-03-20', time: '09:00:00' },
    { date: '2026-03-20', time: '11:00:00' },
    { date: '2026-03-20', time: '14:00:00' },
    { date: '2026-03-21', time: '10:00:00' },
    { date: '2026-03-21', time: '13:00:00' },
    { date: '2026-03-22', time: '09:00:00' },
    { date: '2026-03-22', time: '11:00:00' },
    { date: '2026-03-24', time: '10:00:00' },
    { date: '2026-03-24', time: '13:00:00' },
  ];

  for (const s of slots) {
    await query(`
      INSERT INTO collection_slots (slot_date, slot_time, max_capacity, current_bookings, is_available)
      VALUES (?, ?, 10, 0, TRUE)
    `, [s.date, s.time]);
  }

  console.log('✔ Collection slots seeded');

  // ── 6. LOYALTY RECORDS ──────────────────────────────────────────────────
  // jamie.kelly — 1240 pts (Silver tier)
  await query(`
    INSERT INTO loyalty (customer_id, points_balance, discount_threshold, discount_active, discount_value, points_rate)
    VALUES (?, 1240, 1000, FALSE, 10.00, 1.00)
  `, [customerIds[0]]);

  // s.patel — 200 pts
  await query(`
    INSERT INTO loyalty (customer_id, points_balance, discount_threshold, discount_active, discount_value, points_rate)
    VALUES (?, 200, 1000, FALSE, 10.00, 1.00)
  `, [customerIds[1]]);

  // r.thompson — 580 pts
  await query(`
    INSERT INTO loyalty (customer_id, points_balance, discount_threshold, discount_active, discount_value, points_rate)
    VALUES (?, 580, 1000, FALSE, 10.00, 1.00)
  `, [customerIds[2]]);

  console.log('✔ Loyalty records seeded');

  // ── 7. SAMPLE ORDERS ────────────────────────────────────────────────────
  // Look up a slot and some product IDs for realistic order data
  const slotRows = await query(`SELECT id FROM collection_slots LIMIT 1`);
  const slotId   = slotRows[0]?.id ?? null;

  const productRows = await query(`
    SELECT id, name, price FROM products
    WHERE name IN ('Chantenay Carrots (1kg)', 'Baby Spinach (200g)', 'Free Range Eggs (12)',
                   'New Potatoes (1kg)', 'Full Fat Milk (2L)', 'Wholemeal Bread Loaf')
    LIMIT 6
  `);

  const prod = {};
  for (const r of productRows) prod[r.name] = r;

  // Order 1 — Jamie, collected (complete)
  const o1 = await query(`
    INSERT INTO orders
      (customer_id, collection_slot_id, total_price, discount_applied,
       status, fulfilment_type)
    VALUES (?, ?, 7.40, 0.00, 'collected', 'collection')
  `, [customerIds[0], slotId]);

  const o1id = o1.insertId;

  if (prod['Chantenay Carrots (1kg)']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 2, ?)
    `, [o1id, prod['Chantenay Carrots (1kg)'].id, 'Chantenay Carrots (1kg)', prod['Chantenay Carrots (1kg)'].price]);
  }
  if (prod['Free Range Eggs (12)']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 1, ?)
    `, [o1id, prod['Free Range Eggs (12)'].id, 'Free Range Eggs (12)', prod['Free Range Eggs (12)'].price]);
  }

  await query(`
    INSERT INTO notifications (customer_id, order_id, type, message)
    VALUES (?, ?, 'order_update', ?)
  `, [customerIds[0], o1id, `Order #${o1id} has been collected — thank you!`]);

  // Order 2 — Jamie, confirmed (in progress)
  const slotRows2 = await query(`SELECT id FROM collection_slots LIMIT 1 OFFSET 2`);
  const slot2Id   = slotRows2[0]?.id ?? slotId;

  const o2 = await query(`
    INSERT INTO orders
      (customer_id, collection_slot_id, total_price, discount_applied,
       status, fulfilment_type)
    VALUES (?, ?, 5.90, 0.00, 'confirmed', 'collection')
  `, [customerIds[0], slot2Id]);

  const o2id = o2.insertId;

  if (prod['Baby Spinach (200g)']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 1, ?)
    `, [o2id, prod['Baby Spinach (200g)'].id, 'Baby Spinach (200g)', prod['Baby Spinach (200g)'].price]);
  }
  if (prod['New Potatoes (1kg)']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 2, ?)
    `, [o2id, prod['New Potatoes (1kg)'].id, 'New Potatoes (1kg)', prod['New Potatoes (1kg)'].price]);
  }

  await query(`
    INSERT INTO notifications (customer_id, order_id, type, message)
    VALUES (?, ?, 'order_update', ?)
  `, [customerIds[0], o2id, `Order #${o2id} confirmed — being prepared by the farm.`]);

  // Order 3 — S. Patel, pending (just placed)
  const o3 = await query(`
    INSERT INTO orders
      (customer_id, collection_slot_id, total_price, discount_applied,
       status, fulfilment_type)
    VALUES (?, ?, 3.70, 0.00, 'pending', 'collection')
  `, [customerIds[1], slotId]);

  const o3id = o3.insertId;

  if (prod['Full Fat Milk (2L)']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 1, ?)
    `, [o3id, prod['Full Fat Milk (2L)'].id, 'Full Fat Milk (2L)', prod['Full Fat Milk (2L)'].price]);
  }
  if (prod['Wholemeal Bread Loaf']) {
    await query(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price)
      VALUES (?, ?, ?, 1, ?)
    `, [o3id, prod['Wholemeal Bread Loaf'].id, 'Wholemeal Bread Loaf', prod['Wholemeal Bread Loaf'].price]);
  }

  await query(`
    INSERT INTO notifications (customer_id, order_id, type, message)
    VALUES (?, ?, 'order_update', ?)
  `, [customerIds[1], o3id, `Order #${o3id} placed successfully. Awaiting confirmation.`]);

  // Extra notification — product alert for Jamie
  const spinachRow = prod['Baby Spinach (200g)'];
  if (spinachRow) {
    await query(`
      INSERT INTO notifications (customer_id, product_id, type, message)
      VALUES (?, ?, 'product_available', 'Baby Spinach is back in stock!')
    `, [customerIds[0], spinachRow.id]);
  }

  console.log('✔ Sample orders and notifications seeded');

  // ── 8. PENDING PRODUCER APPLICATIONS ───────────────────────────────────
  // A few producers in pending state so the admin panel has something to approve
  const pendingHash = await bcrypt.hash('Producer123!', SALT_ROUNDS);

  const pendingProducers = [
    { email: 'hilltoporganics@example.com', farm: 'Hilltop Organics',    contact: '07700900010' },
    { email: 'riverbenddairy@example.com',  farm: 'River Bend Dairy',    contact: '07700900011' },
    { email: 'copsewood@example.com',       farm: 'Copse Wood Mushrooms', contact: '07700900012' },
  ];

  for (const p of pendingProducers) {
    await query(`
      INSERT INTO users
        (email, password_hash, role, farm_name, contact_number,
         email_verified, producer_status)
      VALUES (?, ?, 'producer', ?, ?, TRUE, 'pending')
    `, [p.email, pendingHash, p.farm, p.contact]);
  }

  console.log('✔ Pending producer applications seeded');

  // ────────────────────────────────────────────────────────────────────────
  console.log('');
  console.log('Seeding complete.');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:    admin@glh.co.uk              / Admin123!');
  console.log('  Producer: hillsidedairy@glh.co.uk      / Producer123!');
  console.log('  Customer: jamie.kelly@example.com      / Customer123!');
  console.log('  (all 8 approved producers share the same default password)');
  console.log('  (3 pending producers are awaiting admin approval)');
  console.log('');
}
