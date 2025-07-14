// packages/api/migrations/20250714132844_create_shops_and_products_tables.cjs
/** @param { import("knex").Knex } knex */
exports.up = async function (knex) {
  await knex.schema.createTable('shops', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
  });

  await knex.schema.createTable('products', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t
      .integer('shop_id')
      .notNullable()
      .references('shops.id')
      .onDelete('CASCADE');
    t.string('aisle').notNullable();
    t.string('bin').notNullable();
    t.integer('x').notNullable();
    t.integer('y').notNullable();
  });
};

/** @param { import("knex").Knex } knex */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('shops');
};