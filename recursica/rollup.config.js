import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default defineConfig({
  input: './recursica/main.ts',
  output: {
    dir: './dist',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: 'recursica/tsconfig.json',
      sourceMap: true,
      inlineSources: true,
    }),
  ],
  external: [
    // Node.js built-in modules
    'fs',
    'path',
    'process',
    'util',
    'os',
    'crypto',
    'stream',
    'events',
    'buffer',
    'url',
    'querystring',
    'http',
    'https',
    'net',
    'tls',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'readline',
    'repl',
    'tty',
    'vm',
    'zlib',
  ],
});
