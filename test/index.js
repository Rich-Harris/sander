var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var crc32 = require( 'buffer-crc32' );
var sander = require( '../' );

var isWindows = process.platform === 'win32';

process.chdir( __dirname );

describe( 'sander', function () {
	beforeEach( function () {
		return sander.rimraf( 'output' );
	});

	describe( 'readFile', function () {
		it( 'reads a file', function () {
			return sander.readFile( 'input', 'dir', 'text.txt' )
				.then( String )
				.then( function ( data ) {
					assert.equal( data, fs.readFileSync( 'input/dir/text.txt', 'utf-8' ) );
				});
		});

		it( 'reads a file synchronously', function () {
			var data = sander.readFileSync( 'input', 'dir', 'text.txt' ).toString();
			assert.equal( data, fs.readFileSync( 'input/dir/text.txt', 'utf-8' ) );
		});

		it( 'reads a file with encoding', function () {
			return sander.readFile( 'input', 'dir', 'text.txt', { encoding: 'utf-8' })
				.then( function ( data ) {
					assert.equal( data, fs.readFileSync( 'input/dir/text.txt', 'utf-8' ) );
				});
		});

		it( 'reads a file synchronously with encoding', function () {
			var data = sander.readFileSync( 'input', 'dir', 'text.txt', { encoding: 'utf-8' });
			assert.equal( data, fs.readFileSync( 'input/dir/text.txt', 'utf-8' ) );
		});
	});

	describe( 'writeFile', function () {
		it( 'allows options to be provided', function () {
			var buf = new Buffer( [ 32, 32, 192, 192, 32, 32 ] );
			return sander.writeFile( 'output', 'dir', 'out.bin', buf, { encoding: null } ).then( function () {
				return sander.readFile( 'output', 'dir', 'out.bin', { encoding: null } ).then( function (b) {
					for ( var i = 0; i < b.length; i++ ) {
						assert.equal( buf[i], b[i] );
					}
				});
			});
		});
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

	describe( 'symlinkOrCopy', function () {
		it( 'symlinks a directory', function () {
			return sander.symlinkOrCopy( 'input', 'dir' ).to( 'output' )
				.then( function () {
					if (isWindows) {
						var stats = fs.statSync( 'output' );
						assert.ok( stats.isDirectory() );
					} else {
						var lstats = fs.lstatSync( 'output' );
						assert.ok( lstats.isSymbolicLink() );
					}
				});
		});

		it( 'creates intermediate directories', function () {
			return sander.symlinkOrCopy( 'input', 'dir' ).to( 'output/a/b/c' )
				.then( function () {
					if (isWindows) {
						var stats = fs.statSync( 'output/a/b/c' );
						assert.ok( stats.isDirectory() );
					} else {
						var lstats = fs.lstatSync( 'output/a/b/c' );
						assert.ok( lstats.isSymbolicLink() );
					}
				});
		});

		it( 'symlinks a directory synchronously', function () {
			sander.symlinkOrCopySync( 'input', 'dir' ).to( 'output' );

			if (isWindows) {
				var stats = fs.statSync( 'output' );
				assert.ok( stats.isDirectory() );
			} else {
				var lstats = fs.lstatSync( 'output' );
				assert.ok( lstats.isSymbolicLink() );
			}
		});

		it( 'creates intermediate directories when symlinking synchronously', function () {
			sander.symlinkOrCopySync( 'input', 'dir' ).to( 'output/a/b/c' );

			if (isWindows) {
				var stats = fs.statSync( 'output/a/b/c' );
				assert.ok( stats.isDirectory() );
			} else {
				var lstats = fs.lstatSync( 'output/a/b/c' );
				assert.ok( lstats.isSymbolicLink() );
			}
		});

		// TODO override environment so that it thinks we're in Windows and copies instead...
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
