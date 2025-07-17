// packages/api/seeds/02_products.cjs
/** @param { import("knex").Knex } knex */
exports.seed = async function (knex) {
    await knex('products').del();
    await knex('products').insert([
      { id: 1, name: 'Hammer',      shop_id: 1, aisle: 'A', bin: '1', x: 10, y:  5 },
      { id: 2, name: 'Screwdriver', shop_id: 1, aisle: 'B', bin: '2', x: 20, y:  5 },
      { id: 3, name: 'Paint Can',   shop_id: 2, aisle: 'C', bin: '3', x:  5, y: 15 },
    ]);
  };
  