import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isProd = process.env.NODE_ENV === 'production';
const isHot = process.env.HOT === 'HOT';

const config:webpack.Configuration = {
    mode: isProd ? 'production' : 'development',
    resolve:{
        extensions:[".js",".ts"],
        alias:{
            "vue$": "vue/dist/vue.esm.js"
        }
    },
    module: {
        rules: [
            
            {
                test:/\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.(css|scss|sass)$/,
                use: [
                    !isHot ? { loader: MiniCssExtractPlugin.loader } : { loader: "vue-style-loader" },
                    {loader: "css-loader"},
                    {loader: "sass-loader"}
                ]
            }
        ]
    },
    plugins:[
        new webpack.DefinePlugin({
            '__DEV__': !!isProd,
            '__HOT__': isHot
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({

        })
    ]
}
export default config;