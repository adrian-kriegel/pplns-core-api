
const slsw = require('serverless-webpack');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = 
{
  target: 'node',
  entry: slsw.lib.entries,
  mode: 'production',
  node: false,
  externals: ['saslprep'],
  optimization: 
  {
    minimize: false,
  },
  plugins:
  [
    new CopyPlugin(
      {
        patterns:
        [
          {
            from: `../unologin-server/keys/${process.env.UNOLOGIN_ENV}`,
            to: `./keys/${process.env.UNOLOGIN_ENV}`,
          },
        ],
      },
    ),
  ],
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
