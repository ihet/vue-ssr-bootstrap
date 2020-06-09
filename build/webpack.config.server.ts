import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import vueRenderer from 'vue-server-renderer/server-plugin';
import nodeExternals from 'webpack-node-externals';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const isHot = process.env.HOT === 'HOT';

console.dir(process.version)

const serverConfig: webpack.Configuration = {
    entry: {
        app: path.resolve(__dirname, "../src/entry-server.ts")
    },
    devtool: "source-map",
    target: "node",
    output: {
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, "../server")
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
                                "targets": {
                                    node: process.version
                                },
                                "corejs": { "version": 3, "proposals": true },
                                "modules": false
                            }
                        ],
                        [
                            "@babel/preset-typescript",
                            {
                                "allExtensions": true
                            }
                        ]
                    ]
                }
            }
        ]
    },
    externals: nodeExternals({
        whiteList: /\.(css|scss|sass|less|vue)$/
    }),
    plugins: [
        new vueRenderer(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("server"),
            "__DEV__": JSON.stringify(!isProd)
        })
    ]
};

const config = webpackMerge(baseConfig, serverConfig);

export default config;