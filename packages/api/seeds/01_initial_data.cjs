/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('⚙️  Seeding initial shops and products...');

  // Clean out old data
  await knex('products').del();
  await knex('shops').del();

  // Insert shops
  const shops = [
    { id: 1, name: 'Main Warehouse' },
    { id: 2, name: 'Electronics Hub' },
  ];
  await knex('shops').insert(shops);

  // Insert products
  const products = [
    { id: 1, name: 'Laptop',      shop_id: 2 },
    { id: 2, name: 'Smartphone',  shop_id: 2 },
    { id: 3, name: 'Boxed Chairs',shop_id: 1 },
    { id: 4, name: 'Office Desk', shop_id: 1 },
  ];
  await knex('products').insert(products);

  console.log('✅  Seed complete.');
};
