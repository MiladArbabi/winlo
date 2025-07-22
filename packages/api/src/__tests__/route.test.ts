// packages/api/src/__tests__/route.test.ts
import request from 'supertest';
import app from '../app.js';
import type { Knex } from 'knex';
import { jest } from '@jest/globals'
import db from '../db.js';

jest.mock('../db.js', () => {
  const mockDb = jest.fn();
  return { __esModule: true, default: mockDb };
});

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

describe('POST /route', () => {
  const db: jest.Mock = jest.fn();
  const mockRows: Row[] = [
    { id: 1, name: 'A', shop_id: 1, shop_name: 'Store', aisle: 'X', bin: '1', x: 1, y: 1 },
    { id: 2, name: 'B', shop_id: 1, shop_name: 'Store', aisle: 'Y', bin: '2', x: 4, y: 5 },
  ];

  beforeEach(() => {
    db.mockReturnValue({
      select: () => ({
        join: () => ({
          whereIn: (_col: string, ids: number[]) =>
            Promise.resolve(
              ids.map(id => ({
                id,
                name: `P${id}`,
                shop_id: 1,
                shop_name: 'S',
                aisle: 'A',
                bin: '1',
                x: id,
                y: id,
              }))
            )
        }),
      }),
    });
  });

  it('rejects bad payload', async () => {
    const res = await request(app).post('/v1/route').send({ productIds: ['foo'] });
    expect(res.status).toBe(400);
  });

  it('returns a nearest-neighbor route + totalDistance', async () => {
    const res = await request(app).post('/v1/route').send({ productIds: [1, 2] });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.route)).toBe(true);
    expect(typeof res.body.totalDistance).toBe('number');
    expect(res.body.route.map((p: any) => p.id)).toEqual([1, 2]);
  });
});
