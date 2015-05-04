var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var crc32 = require( 'buffer-crc32' );
var sander = require( '../' );

process.chdir( __dirname );

describe( 'sander', function () {
	beforeEach( function () {
		return sander.rimraf( 'output' );
	});

	describe( 'copydir', function () {
		it( 'copies a directory', function () {
			return sander.copydir( 'input', 'dir' ).to( 'output' ).then( function () {
				checkEquality([ 'input', 'dir' ], [ 'output' ]);
			});
		});

		it( 'copies a directory synchronously', function () {
			sander.copydirSync( 'input', 'dir' ).to( 'output' );
			checkEquality([ 'input', 'dir' ], [ 'output' ]);
		});
	});

	describe( 'appendFile', function () {
		it( 'appends to a file', function () {
			return sander.writeFile( 'output/test.txt', 'first line' )
				.then( function () {
					return sander.appendFile( 'output/test.txt', '\nsecond line' )
				})
				.then( function () {
					return sander.readFile( 'output/test.txt' )
						.then( String )
						.then( function ( combined ) {
							assert.equal( combined, 'first line\nsecond line' );
						});
				});
		});

		it( 'appends to a file synchronously', function () {
			sander.writeFileSync( 'output/test.txt', 'first line' );
			sander.appendFileSync( 'output/test.txt', '\nsecond line' );

			var combined = sander.readFileSync( 'output/test.txt' ).toString();
			assert.equal( combined, 'first line\nsecond line' );
		});
	});
});


function checkEquality ( a, b ) {
	var statsA, statsB, filesA, filesB, crcA, crcB;

	a = path.resolve.apply( null, a );
	b = path.resolve.apply( null, b );

	statsA = fs.statSync( a );
	statsB = fs.statSync( b );

	if ( statsA.isDirectory() ) {
		assert.ok( statsB.isDirectory(),  a + ' is a directory but ' + b + ' is not' );

		filesA = fs.readdirSync( a );
		filesB = fs.readdirSync( b );

		assert.ok( compareArrays( filesA, filesB ) );

		i = filesA.length;
		while ( i-- ) {
			checkEquality([ a, filesA[i] ], [ b, filesB[i] ]);
		}
	}

	else {
		crcA = crc32( fs.readFileSync( a ) );
		crcB = crc32( fs.readFileSync( b ) );

		assert.equal( crcA.toString(), crcB.toString() );
	}
}

function compareArrays ( a, b ) {
	var i = a.length;

	if ( b.length !== i ) {
		return false;
	}

	a.sort();
	b.sort();

	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}
