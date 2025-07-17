// packages/api/babel.config.js
module.exports = {
    presets: [
      // compile to your current Node.js version
      ['@babel/preset-env', { targets: { node: 'current' } }],
      // enable stripping TypeScript syntax
      '@babel/preset-typescript',
    ],
  };
  