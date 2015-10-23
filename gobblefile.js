var gobble = require( 'gobble' );

module.exports = gobble([
	// CommonJS build
	gobble( 'src' ).transform( 'rollup-babel', {
		entry: 'sander.js',
		dest: 'sander.cjs.js',
		format: 'cjs',
		external: [ 'graceful-fs', 'es6-promise', 'path', 'mkdirp', 'fs', 'rimraf' ],
		sourceMap: true
	}),

	// ES6 build
	gobble( 'src' ).transform( 'rollup-babel', {
		entry: 'sander.js',
		dest: 'sander.es6.js',
		format: 'es6',
		external: [ 'graceful-fs', 'es6-promise', 'path', 'mkdirp', 'fs', 'rimraf' ],
		sourceMap: true
	})
]);
