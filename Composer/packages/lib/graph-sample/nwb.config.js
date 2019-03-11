module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: {
			global: 'ReactNwbTest',
			externals: {
				react: 'React'
			}
		}
	},
	webpack: {
		rules: {
			'sass': {
				loader: 'sass-loader',
				options: {
					includePaths: [ './src' ]
				}
			}
		}
	}
};
