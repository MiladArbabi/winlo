var _a;
// packages/api/src/index.ts
import app from './app.js';
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
