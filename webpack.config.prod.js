const devConfig = require('./webpack.config.dev');

module.exports = {
	...devConfig,
	mode: 'production',
};