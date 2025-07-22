// packages/api/src/__tests__/products.test.ts
import { jest }   from '@jest/globals';
import request     from 'supertest';

// Force “test” so we skip real Redis cache by default
process.env.NODE_ENV = 'test';

// 1) Mock before importing app, db, and redis
await jest.unstable_mockModule('../db.js', () => ({
  __esModule: true,
  default: jest.fn(),            // our db() mock
}));
await jest.unstable_mockModule('../redis.js', () => ({
  __esModule: true,
  redisClient: {
    get: jest.fn(async () => null),
    set: jest.fn(async () => {}),
  },
}));

// 2) Now import app, db, and redisClient:
const [
  { default: app },
  { default: db },
  { redisClient },
] = await Promise.all([
  import('../app.js'),
  import('../db.js'),
  import('../redis.js'),
]);

describe('GET /v1/products', () => {
  type Row = {
    id:        number;
    name:      string;
    shop_id:   number;
    shop_name: string;
    aisle:     string;
    bin:       string;
    x:         number;
    y:         number;
  };

  // cast db to jest.Mock so TS lets us mock return values:
  const dbMock    = db as unknown as jest.Mock;
  const cacheGet  = redisClient.get as unknown as jest.Mock;
  const cacheSet  = redisClient.set as unknown as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('400 on invalid query parameters', async () => {
    const res = await request(app)
      .get('/v1/products')
      .query({ limit: 'not-a-number' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid query parameters');
  });

  it('200 + default paging + correct mapping when no query params', async () => {
    const rows: Row[] = [
      { id: 1, name: 'Hammer',      shop_id: 1, shop_name: 'Main Store', aisle: 'A', bin: '1', x: 10, y: 5 },
      { id: 2, name: 'Screwdriver', shop_id: 1, shop_name: 'Main Store', aisle: 'B', bin: '2', x: 20, y: 5 },
    ];

    const baseBuilder: any = {
      select: jest.fn().mockReturnThis(),
      join:   jest.fn(async () => rows),
    };

    dbMock.mockReturnValue(baseBuilder);

    const res = await request(app).get('/v1/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      page:  1,
      limit: 50,
      data: rows.map(r => ({
        id:       r.id,
        name:     r.name,
        shop:     { id: r.shop_id, name: r.shop_name },
        location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y },
      })),
    });
  });

  it('200 + uses Redis cache when available (short‑circuits DB)', async () => {
    process.env.NODE_ENV = 'production';
    const cached = {
      page: 1,
      limit: 3,
      data: [{ id: 42, name: 'Cached', shop: { id: 9, name: 'X' }, location: { aisle: 'Z', bin: '9', x: 0, y: 0 } }]
    };
    cacheGet.mockImplementation(async () => JSON.stringify(cached));

    const res = await request(app).get('/v1/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cached);
    expect(dbMock).not.toHaveBeenCalled();
  });

  it('200 + pagination, filtering, sorting & caches the result when params present', async () => {
    process.env.NODE_ENV = 'production';

    const existBuilder: any = {
      select: jest.fn().mockReturnThis(),
      join:   jest.fn().mockReturnThis(),
    };

    const pagedRows: Row[] = [
      { id: 3, name: 'Wrench', shop_id: 2, shop_name: 'Branch', aisle: 'C', bin: '3', x: 30, y: 15 },
    ];

    const pagedBuilder: any = {
      select:   jest.fn().mockReturnThis(),
      join:     jest.fn().mockReturnThis(),
      where:    jest.fn().mockReturnThis(),
      orderBy:  jest.fn().mockReturnThis(),
      limit:    jest.fn().mockReturnThis(),
      offset:   jest.fn(async () => pagedRows),
    };

    dbMock
      .mockReturnValueOnce(existBuilder)
      .mockReturnValueOnce(pagedBuilder);

    const res = await request(app)
      .get('/v1/products')
      .query({ shop: '2', limit: '1', page: '2', sort: 'x', order: 'desc' });

    expect(res.status).toBe(200);
    const expectedPayload = {
      page:  2,
      limit: 1,
      data: pagedRows.map(r => ({
        id:       r.id,
        name:     r.name,
        shop:     { id: r.shop_id, name: r.shop_name },
        location: { aisle: r.aisle, bin: r.bin, x: r.x, y: r.y },
      })),
    };
    expect(res.body).toEqual(expectedPayload);

    // verify DB chain calls
    expect(pagedBuilder.where).toHaveBeenCalledWith('products.shop_id', 2);
    expect(pagedBuilder.orderBy).toHaveBeenCalledWith('products.x', 'desc');
    expect(pagedBuilder.limit).toHaveBeenCalledWith(1);
    expect(pagedBuilder.offset).toHaveBeenCalledWith((2 - 1) * 1);

    // verify cache set was called with correct key & value
    const expectedKey = `products:${JSON.stringify({ shop: '2', limit: '1', page: '2', sort: 'x', order: 'desc' })}`;
    expect(cacheSet).toHaveBeenCalledWith(
      expectedKey,
      JSON.stringify(expectedPayload),
      { EX: 60 }
    );
  });

  it('500 on DB errors (next(err) path)', async () => {
    const dbError = new Error('DB failure');
    const errorBuilder: any = {
      select: jest.fn().mockReturnThis(),
      join:   jest.fn(async () => { throw dbError }),
    };
    dbMock.mockReturnValue(errorBuilder);

    const res = await request(app).get('/v1/products');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'DB failure');
  });
});