const webpack = require('webpack');

const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: ['./app/index.js', './app/scss/main.scss'],
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				]
			},
			{
				test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3|html)$/,
				loader: "file"
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new CopyWebpackPlugin([
			{ from: './app/static' }
		]),
		new MiniCssExtractPlugin({
			filename: 'style.css',
		}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(require("./package.json").version)
		})
	],
};
