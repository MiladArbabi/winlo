var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// We'll re‑mock process.env.NODE_ENV and the 'redis' module between tests
jest.resetModules();
describe('redis.ts', () => {
    let mockOn;
    let mockConnect;
    let createClient;
    let loggerError;
    beforeEach(() => {
        // reset NODE_ENV to undefined so module picks up default (development)
        delete process.env.NODE_ENV;
        // spy on our logger.error
        loggerError = jest.spyOn(require('../logger.js').logger, 'error');
        // createClient() returns an EventEmitter with .on and .connect
        mockOn = jest.fn();
        mockConnect = jest.fn().mockResolvedValue(undefined);
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
    it('registers an error handler and calls connect in non-test mode', () => __awaiter(void 0, void 0, void 0, function* () {
        // default NODE_ENV is undefined ⇒ not 'test'
        const { redisClient } = yield import('../redis.js');
        // createClient must have been called with our default URL
        expect(createClient).toHaveBeenCalledWith({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        // error‐listener registration
        expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
        // connect() is called once because we're not in test
        expect(mockConnect).toHaveBeenCalled();
    }));
    it('does not call connect when NODE_ENV=test', () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.NODE_ENV = 'test';
        const { redisClient } = yield import('../redis.js');
        // registration still happens…
        expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
        // … but connect() is skipped
        expect(mockConnect).not.toHaveBeenCalled();
    }));
    it('logs when connect().catch() fires', () => __awaiter(void 0, void 0, void 0, function* () {
        // simulate non-test, and have connect() reject
        mockConnect.mockRejectedValueOnce(new Error('no go'));
        const { redisClient } = yield import('../redis.js');
        // wait a tick for the fire‑and‑forget .connect().catch()
        yield new Promise(process.nextTick);
        // our catch logger should have run
        expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ err: expect.any(Error) }), 'Failed to connect to Redis');
    }));
});
export {};
