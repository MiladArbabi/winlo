var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// packages/api/__tests__/route.test.ts
import request from 'supertest';
import app from '../app.js';
import db from '../db.js';
jest.mock('../db.js', () => ({
    __esModule: true,
    default: jest.fn(),
}));
describe('POST /route', () => {
    const mockRows = [
        { id: 1, name: 'A', shop_id: 1, shop_name: 'Store', aisle: 'X', bin: '1', x: 1, y: 1 },
        { id: 2, name: 'B', shop_id: 1, shop_name: 'Store', aisle: 'Y', bin: '2', x: 4, y: 5 },
    ];
    beforeEach(() => {
        const mockedDb = db;
        mockedDb.mockReturnValue({
            select: () => ({
                join: () => ({
                    whereIn: (_col, ids) => Promise.resolve(ids.map(id => ({
                        id,
                        name: `P${id}`,
                        shop_id: 1,
                        shop_name: 'S',
                        aisle: 'A',
                        bin: '1',
                        x: id,
                        y: id,
                    })))
                }),
            }),
        });
    });
    it('rejects bad payload', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app).post('/v1/route').send({ productIds: ['foo'] });
        expect(res.status).toBe(400);
    }));
    it('returns a nearest-neighbor route + totalDistance', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app).post('/v1/route').send({ productIds: [1, 2] });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.route)).toBe(true);
        expect(typeof res.body.totalDistance).toBe('number');
        expect(res.body.route.map((p) => p.id)).toEqual([1, 2]);
    }));
});
