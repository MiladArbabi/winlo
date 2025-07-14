// packages/api/migrations/20250712122919_init_schema.cjs
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    try {
      await knex.schema
        .createTable('shops', function(table) {
          table.increments('id');
          table.string('name').notNullable();
          table.timestamps(true, true);
        })
        .createTable('products', function(table) {
          table.increments('id');
          table.string('name').notNullable();
          table
            .integer('shop_id')
            .unsigned()
            .references('shops.id')
            .onDelete('CASCADE');
          table.timestamps(true, true);
        });
      console.log('✅  [migration] up finished.');
    } catch (err) {
      console.error('🛑  [migration] up failed:', err);
      throw err;
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
    try {
      await knex.schema
        .dropTableIfExists('products')
        .dropTableIfExists('shops');
      console.log('✅  [migration] down finished.');
    } catch (err) {
      console.error('🛑  [migration] down failed:', err);
      throw err;
    }
  };  