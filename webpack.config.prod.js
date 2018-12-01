const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = {
	entry: ['./app/index.js', './app/scss/main.scss'],
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'style.css',
		}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(require("./package.json").version)
		})
	],
};