// packages/api/src/db/seeds/02_shops_with_secret.cjs
exports.seed = async function (knex) {
    await knex('shops').del();
    await knex('shops').insert([
      { id: 1, name: 'Main Store', secret: process.env.SHOP1_SECRET || 'secret1' },
      { id: 2, name: 'Outlet',     secret: process.env.SHOP2_SECRET || 'secret2' }
    ]);
  };  