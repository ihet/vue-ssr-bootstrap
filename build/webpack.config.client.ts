import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import vueRenderer from 'vue-server-renderer/client-plugin';
import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';
const isHot = process.env.HOT === 'HOT';

const clientConfig: webpack.Configuration = {
  entry: {
    app: path.resolve(__dirname, "../src/entry-client.ts")
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/dist",
    filename: "js/[name]_[hash].js",
    chunkFilename: "js/chunks/[name]_[hash].js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          "presets": [
            [
              "@babel/preset-env",
              {
                  "useBuiltIns": "usage",
                  "targets": "> 0.25%, not dead",
                  "corejs": { "version": 3, "proposals": true },
                  "modules": false
              }
            ]
          ]
        }
      }
    ]
  },
  devtool: isProd ? false : "source-map",
  target: 'web',
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 4,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        lib: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vuex|axios)[\\/]/,
          enforce: true,
          priority: 10,
          name: "lib"
        }
      }
    }
  },
  plugins: [
    new vueRenderer(),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("client"),
      "__DEV__": JSON.stringify(!isProd)
    })
  ]
}
const config = webpackMerge(baseConfig, clientConfig);
export default config;