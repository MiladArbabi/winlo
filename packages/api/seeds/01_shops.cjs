// packages/api/seeds/01_shops.cjs
/** @param { import("knex").Knex } knex */
exports.seed = async function (knex) {
  await knex('shops').del();
  await knex('shops').insert([
    { id: 1, name: 'Main Store' },
    { id: 2, name: 'Outlet' }
  ]);
};
