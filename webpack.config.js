
const slsw = require('serverless-webpack');

module.exports = 
{
  target: 'node',
  entry: slsw.lib.entries,
  mode: 'production',
  node: false,
  optimization: 
  {
    minimize: false,
  },
  plugins: [],
  devtool: 'inline-cheap-module-source-map',
  resolve: 
  {
    extensions: ['.ts', '.js'],
    modules: ['node_modules'],
  },
  module: 
  {
    rules: 
    [
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
    ],
  },
};
