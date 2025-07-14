// packages/api/src/knexfile.cjs.d.ts
declare module '../knexfile.cjs' {
    /**
     * Our CJS-style knexfile exports an object
     * keyed by environment name. We’ll just
     * declare it `any` for now:
     */
    const config: Record<string, any>;
    export default config;
  }
  