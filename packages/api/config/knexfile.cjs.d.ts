// packages/api/src/knexfile.cjs.d.ts
declare module './knexfile.cjs' {
  interface KnexConfig {
    [key: string]: any;
  }
  const config: KnexConfig;
  export default config;
}