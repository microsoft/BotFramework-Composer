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
			'sass-css': {
				modules: true,
				localIdentName: '[hash:base64:5]'
			}
		},
		extra: {
			entry: './src/index',
			resolve: {
				extensions: [ '.ts', '.tsx', '.js', '.jsx' ]
			},
			module: {
				rules: [ { test: /\.(tsx|ts)$/, loader: 'ts-loader' } ]
			}
		}
	}
};
