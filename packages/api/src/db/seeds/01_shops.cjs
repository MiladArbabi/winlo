//  packages/api/src/db/seeds/01_shops.cjs
/** @param { import("knex").Knex } knex */
exports.seed = async (knex) => {
  await knex('shops').del();
  await knex('shops').insert([
    { id: 1, name: 'Main Store', secret: 'secret1' },
    { id: 2, name: 'Outlet',     secret: 'secret2' },
  ]);
};



