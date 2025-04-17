import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist/types',
        },
      },
    }),
    postcss({
      modules: true,
      extract: false,
      minimize: true,
      sourceMap: true,
      use: ['sass'],
    }),
  ],
  external: ['react', 'react-dom', 'framer-motion', 'clsx'],
};
