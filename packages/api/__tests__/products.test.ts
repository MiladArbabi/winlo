// packages/api/__tests__/products.test.ts
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db.js';

jest.mock('../src/db.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// mirror the Row shape your real code selects
type Row = {
  id: number;
  name: string;
  shop_id: number;
  shop_name: string;
  aisle: string;
  bin: string;
  x: number;
  y: number;
};

describe('GET /products', () => {
  // now TS knows mockRows is Row[]
  const mockRows: Row[] = [
    { id: 1, name: 'Hammer', shop_id: 1, shop_name: 'Main Store', aisle: 'A', bin: '1', x: 10, y: 5 }
  ];

  beforeAll(() => {
    // cast db to Jest mock so TS lets you call mockReturnValueOnce
    const mockedDb = db as unknown as jest.Mock<any, any>;
    mockedDb.mockReturnValueOnce(
      // pretend this object is any, so TS stops type-checking .join()
      ({
        select: () => ({
          join: () => Promise.resolve(mockRows),
        }),
      } as any)
    );
  });

  it('responds with products + shop + location', async () => {
    const res = await request(app)
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
        });

  it('supports pagination, filtering & sorting', async () => {
    const mockedDb = db as unknown as jest.Mock<any, any>;
      mockedDb
        .mockReturnValueOnce({
          select: () => ({
                join: () => Promise.resolve(mockRows),
              }),
            } as any)
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
            } as any);
        
          const res = await request(app)
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
        });
      });