// packages/api/migrations/20250715000000_add_product_indexes.cjs
exports.up = async function(knex) {
    await knex.schema.alterTable('products', table => {
      table.index('shop_id', 'idx_products_shop_id');
      table.index(['x', 'y'],   'idx_products_coordinates');
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
    await knex.schema.alterTable('products', table => {
      table.dropIndex('shop_id',             'idx_products_shop_id');
      table.dropIndex(['x', 'y'],            'idx_products_coordinates');
    });
  };