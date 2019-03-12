module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: false
	},
	// only influence nwb demo scripts
	webpack: {
		rules: {
			'sass': {
				loader: 'sass-loader',
				options: {
					includePaths: [ './dist' ]
				}
			}
		}
	}
};
