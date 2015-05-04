var gobble = require( 'gobble' );

module.exports = gobble( 'src' )
	.transform( 'babel' )
	.transform( 'esperanto-bundle', {
		entry: 'sander',
		type: 'cjs',
		strict: true
	});