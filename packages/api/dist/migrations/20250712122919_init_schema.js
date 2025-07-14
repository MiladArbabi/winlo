var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema
            .createTable('shops', (table) => {
            table.increments('id');
            table.string('name').notNullable();
            table.timestamps(true, true);
        })
            .createTable('products', (table) => {
            table.increments('id');
            table.string('name').notNullable();
            table.integer('shop_id').unsigned().references('shops.id');
            table.timestamps(true, true);
        });
    });
}
export function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema
            .dropTable('products')
            .dropTable('shops');
    });
}
