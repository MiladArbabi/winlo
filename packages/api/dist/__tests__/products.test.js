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
    it('returns 400 when query params are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        // e.g. non-numeric limit
        const res = yield request(app)
            .get('/v1/products')
            .query({ limit: 'not-a-number' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid query parameters');
        // details will include a parse error for .limit
        expect(res.body.details.limit).toBeDefined();
    }));
    it('short‑circuits and returns cached payload on cache hit', () => __awaiter(void 0, void 0, void 0, function* () {
        // temporarily simulate non-test env so caching runs
        const oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        // spy on redisClient.get and logger.info
        const { redisClient } = yield import('../redis.js');
        const { logger } = yield import('../logger.js');
        jest.spyOn(redisClient, 'get').mockResolvedValueOnce(JSON.stringify({ page: 1, limit: 50, data: [{ id: 9, name: 'Cached', shop: { id: 1, name: 'Store' }, location: { aisle: 'Z', bin: '9', x: 0, y: 0 } }] }));
        const infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => { });
        const res = yield request(app).get('/v1/products');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            page: 1,
            limit: 50,
            data: [
                { id: 9, name: 'Cached', shop: { id: 1, name: 'Store' }, location: { aisle: 'Z', bin: '9', x: 0, y: 0 } }
            ]
        });
        // verify we logged the cache hit
        expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({ cacheKey: 'products:{}' }), 'cache hit');
        // restore env
        process.env.NODE_ENV = oldEnv;
    }));
    it('filters by shop only (default sort/page) via where→orderBy→limit→offset', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedDb = db;
        // 1st call for base to check maybeRows (we don’t use it when hasParams=true, but your code still awaits it)
        mockedDb.mockReturnValueOnce({
            select: () => ({
                join: () => Promise.resolve(mockRows),
            }),
        });
        // 2nd call for qb → where → orderBy → limit → offset
        mockedDb.mockReturnValueOnce({
            select: () => ({
                join: () => ({
                    where: () => ({
                        orderBy: () => ({
                            limit: () => ({
                                offset: () => Promise.resolve([
                                    {
                                        id: 3,
                                        name: 'Wrench',
                                        shop_id: 2,
                                        shop_name: 'Side Store',
                                        aisle: 'C',
                                        bin: '3',
                                        x: 30,
                                        y: 15
                                    },
                                ]),
                            }),
                        }),
                    }),
                }),
            }),
        });
        const res = yield request(app)
            .get('/v1/products')
            .query({ shop: '2' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            page: 1,
            limit: 50,
            data: [
                {
                    id: 3,
                    name: 'Wrench',
                    shop: { id: 2, name: 'Side Store' },
                    location: { aisle: 'C', bin: '3', x: 30, y: 15 },
                },
            ],
        });
    }));
    it('returns 500 when the DB layer throws', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedDb = db;
        // stub the very first call to reject
        mockedDb.mockReturnValueOnce({
            select: () => ({
                join: () => Promise.reject(new Error('db down')),
            }),
        });
        const res = yield request(app).get('/v1/products');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Internal Server Error' });
    }));
});
describe('extra GET /products branches', () => {
    const mockRows = [
        { id: 1, name: 'Hammer', shop_id: 1, shop_name: 'Main Store', aisle: 'A', bin: '1', x: 10, y: 5 }
    ];
    it('filters by shop only via where→orderBy→limit→offset', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedDb = db;
        // first call for maybeRows (we don’t use it when hasParams=true)
        mockedDb.mockReturnValueOnce({
            select: () => ({ join: () => Promise.resolve(mockRows) }),
        });
        // second call drives the filtered path
        mockedDb.mockReturnValueOnce({
            select: () => ({
                join: () => ({
                    where: () => ({
                        orderBy: () => ({
                            limit: () => ({
                                offset: () => Promise.resolve([
                                    { id: 3, name: 'Wrench', shop_id: 2, shop_name: 'Side Store', aisle: 'C', bin: '3', x: 30, y: 15 }
                                ])
                            })
                        })
                    })
                })
            })
        });
        const res = yield request(app)
            .get('/v1/products')
            .query({ shop: '2' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            page: 1,
            limit: 50,
            data: [{
                    id: 3,
                    name: 'Wrench',
                    shop: { id: 2, name: 'Side Store' },
                    location: { aisle: 'C', bin: '3', x: 30, y: 15 },
                }],
        });
    }));
    it('returns 500 when the DB layer throws', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedDb = db;
        // stub the very first .join() to reject
        mockedDb.mockReturnValueOnce({
            select: () => ({ join: () => Promise.reject(new Error('db down')) }),
        });
        const res = yield request(app).get('/v1/products');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Internal Server Error' });
    }));
});
