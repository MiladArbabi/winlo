var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// packages/api/__tests__/products.test.ts
import request from 'supertest';
import app from '../app.js';
import db from '../db.js';
jest.mock('../db.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));
describe('GET /products', () => {
    // now TS knows mockRows is Row[]
    const mockRows = [
        { id: 1, name: 'Hammer', shop_id: 1, shop_name: 'Main Store', aisle: 'A', bin: '1', x: 10, y: 5 }
    ];
    beforeAll(() => {
        // cast db to Jest mock so TS lets you call mockReturnValueOnce
        const mockedDb = db;
        mockedDb.mockReturnValueOnce(
        // pretend this object is any, so TS stops type-checking .join()
        {
            select: () => ({
                join: () => Promise.resolve(mockRows),
            }),
        });
    });
    it('responds with products + shop + location', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .get('/v1/products');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            page: 1,
            limit: 50,
            data: [
                {
                    id: 1,
                    name: 'Hammer',
                    shop: { id: 1, name: 'Main Store' },
                    location: { aisle: 'A', bin: '1', x: 10, y: 5 },
                },
            ],
        });
    }));
    it('supports pagination, filtering & sorting', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedDb = db;
        mockedDb
            .mockReturnValueOnce({
            select: () => ({
                join: () => Promise.resolve(mockRows),
            }),
        })
            .mockReturnValueOnce({
            select: () => ({
                join: () => ({
                    where: () => ({
                        orderBy: () => ({
                            limit: () => ({
                                offset: () => Promise.resolve([
                                    { id: 2, name: 'Screwdriver', shop_id: 1, shop_name: 'Main Store', aisle: 'B', bin: '2', x: 20, y: 5 },
                                ]),
                            }),
                        }),
                    }),
                }),
            }),
        });
        const res = yield request(app)
            .get('/v1/products')
            .query({ shop: '1', limit: '1', page: '2', sort: 'x', order: 'desc' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            page: 2,
            limit: 1,
            data: [
                {
                    id: 2,
                    name: 'Screwdriver',
                    shop: { id: 1, name: 'Main Store' },
                    location: { aisle: 'B', bin: '2', x: 20, y: 5 },
                },
            ],
        });
    }));
});
