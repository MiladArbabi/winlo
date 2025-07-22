// packages/api/src/__tests__/redis.test.ts
import { EventEmitter } from 'events';
import { jest } from '@jest/globals';

// 1) Reset modules before any mocks
jest.resetModules();

// // 2) Mock our logger *before* redis.ts is ever imported
// jest.mock('../logger.js', () => ({
//     __esModule: true,
//     logger: { error: jest.fn() },
//   }));

// 3) Redis mock will be overwritten in each beforeEach
describe('redis.ts', () => {
  let mockOn: jest.Mock;
  let mockConnect: jest.Mock; 
  let createClient: jest.Mock;
  let loggerError: any; // Use any to bypass TS2694, or import correct type if availableconst { logger } = await import('../logger.js')

  beforeEach(() => {
    // reset NODE_ENV to undefined so module picks up default (development)
    delete process.env.NODE_ENV;
    // createClient() returns an EventEmitter with .on and .connect
    mockOn = jest.fn();
    mockConnect = jest.fn(() => Promise.resolve(undefined));
    createClient = jest.fn(() => ({
      on: mockOn,
      connect: mockConnect,
    }));

    // mock out 'redis' before we import the module under test
    jest.doMock('redis', () => ({ createClient }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('registers an error handler and calls connect in non-test mode', async () => {
    // default NODE_ENV is undefined ⇒ not 'test'
    const { redisClient } = await import('../redis.js');

    // createClient must have been called with our default URL
    expect(createClient).toHaveBeenCalledWith({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // error-listener registration
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));

    // connect() is called once because we're not in test
    expect(mockConnect).toHaveBeenCalled();
  });

  it('does not call connect when NODE_ENV=test', async () => {
    process.env.NODE_ENV = 'test';
    const { redisClient } = await import('../redis.js');

    // registration still happens…
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));

    // … but connect() is skipped
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('logs when connect().catch() fires', async () => {
    mockConnect.mockImplementationOnce(() => Promise.reject(new Error('no go')));
    // import the real logger and spy on its .error
    const { logger } = await import('../logger.js');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    await import('../redis.js');     // triggers the fire‑and‑forget connect().catch()
 
    // wait a tick for the fire-and-forget .connect().catch()
    await new Promise(process.nextTick);

    // our catch logger should have run
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Failed to connect to Redis',
    );
  });
})
