// packages/api/src/db/migrations/20250723_add_shop_secret.cjs
exports.up = function (knex) {
    return knex.schema.alterTable('shops', tbl => {
      tbl.string('secret').notNullable().defaultTo('');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('shops', tbl => {
      tbl.dropColumn('secret');
    });
  };
  