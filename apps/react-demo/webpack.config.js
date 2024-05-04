const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');

module.exports = {
  // module: {
  //   rules: [
  //     {
  //       test: /\.tsx$/i,
  //       use: 'raw-loader',
  //     }
  //   ]
  // },
  output: {
    path: join(__dirname, '../../dist/react-demo'),
  },
  devServer: {
    port: 4200,
    historyApiFallback: true,
  },
  plugins: [
    new NxWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: ['./src/styles.css'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({}),
  ],
};
