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
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'style.css',
		  }),
	  ],
};