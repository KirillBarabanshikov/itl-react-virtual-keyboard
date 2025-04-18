import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      clean: true,
    }),
    postcss({
      extract: true,
      modules: false,
      sourceMap: true,
      minimize: true,
      plugins: [
        require('postcss-url')({
          url: (asset) => {
            return `/assets/icons/${asset.url.split('/').pop()}`;
          },
        }),
      ],
    }),
    copy({
      targets: [
        {
          src: 'src/assets/fonts/*',
          dest: 'dist/assets/fonts',
        },
        {
          src: 'src/assets/icons/*',
          dest: 'dist/assets/icons',
        },
      ],
      copyOnce: true,
    }),
  ],
};
