var path = require( 'path' ),
	fs = require( 'fs' ),
	Promise = require( 'es6-promise' ).Promise,
	mkdirp = require( 'mkdirp' ),

	sander = exports,

	standardMethods,
	fileDescriptorMethods;

standardMethods = 'truncate chown lchown chmod lchmod stat lstat readlink realpath unlink rmdir readdir utimes readFile'.split( ' ' );
fileDescriptorMethods = 'close ftruncate fchown fchmod fstat futimes fsync read'.split( ' ' );

standardMethods.forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method;

		qualifiedMethodName = isSync ? methodName + 'Sync' : methodName;

		method = function () {
			var buildingPath = true,
				pathargs = [],
				args = [ null ],
				resolvedPath,
				len = arguments.length,
				i;

			for ( i = 0; i < len; i += 1 ) {
				if ( buildingPath && typeof arguments[i] === 'string' ) {
					pathargs[i] = arguments[i];
				} else {
					buildingPath = false;
					args.push( arguments[i] );
				}
			}

			args[0] = resolvedPath = resolve( pathargs );

			if ( isSync ) {
				return fs[ qualifiedMethodName ].apply( fs, args );
			}

			return new Promise( function ( fulfil, reject ) {
				var callback = function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( result );
					}
				};

				args.push( callback );
				fs[ methodName ].apply( fs, args );
			});
		};

		sander[ qualifiedMethodName ] = method;
	});
});

fileDescriptorMethods.forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method;

		qualifiedMethodName = isSync ? methodName + 'Sync' : methodName;

		method = function () {
			var args, i;

			if ( isSync ) {
				return fs[ qualifiedMethodName ].apply( fs, arguments );
			}

			args = [];
			i = arguments.length;
			while ( i-- ) {
				args[i] = arguments[i];
			}

			return new Promise( function ( fulfil, reject ) {
				var callback = function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( result );
					}
				};

				args.push( callback );
				fs[ qualifiedMethodName ].apply( fs, args );
			});
		};

		sander[ qualifiedMethodName ] = method;
	});
});

// sander.rename, sander.renameSync, sander.link, sander.linkSync
[ 'rename', 'link' ].forEach( function ( methodName ) {
	[ true, false ].forEach( function ( isSync ) {
		var qualifiedMethodName, method;

		qualifiedMethodName = isSync ? methodName + 'Sync' : methodName;

		method = function () {
			var src = resolve( arguments );

			return {
				to: function () {
					var dest = resolve( arguments );

					if ( isSync ) {
						return fs[ qualifiedMethodName ]( src, dest );
					}

					return new Promise( function ( fulfil, reject ) {
						fs[ qualifiedMethodName ]( src, dest, function ( err, result ) {
							if ( err ) {
								reject( err );
							} else {
								fulfil();
							}
						});
					});
				}
			};
		};

		sander[ qualifiedMethodName ] = method;
	});
});

// sander.symlink, sander.symlinkSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'symlinkSync' : 'symlink';

	method = function () {
		var src = resolve( arguments );

		return {
			to: function () {
				var pathargs, options, dest;

				if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
					options = arguments[ arguments.length - 1 ];

					pathargs = [];
					i = arguments.length - 1;
					while ( i-- ) {
						pathargs[i] = arguments[i];
					}
				} else {
					options = {};
					pathargs = arguments;
				}

				dest = resolve( pathargs );

				if ( isSync ) {
					return fs.symlinkSync( src, dest, options.type );
				}

				return new Promise( function ( fulfil, reject ) {
					fs.symlink( src, dest, options.type, function ( err, result ) {
						if ( err ) {
							reject( err );
						} else {
							fulfil();
						}
					});
				});
			}
		};
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.open, sander.openSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'openSync' : 'open';

	method = function () {
		var pathargs, options, flags, src, alreadyExists;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			options = arguments[ arguments.length - 1 ];
			flags = arguments[ arguments.length - 2 ];

			pathargs = [];
			i = arguments.length - 2;
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			options = {};
			flags = arguments.length - 1;

			pathargs = [];
			i = arguments.length - 1;
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		}

		src = resolve( pathargs );

		shouldCreateDirs = /^[wa]/.test( flags );
		exclusive = /^.x/.test( flags );

		if ( exclusive ) {
			// if the file exists already, ABORT ABORT ABORT
			try {
				fs.statSync( src );
				alreadyExists = true;
			} catch ( err ) {
				if ( err.code !== 'ENOENT' ) {
					throw err;
				}
			}

			if ( alreadyExists ) {
				// attempt the operation = that way, we get the intended error message
				fs.openSync( src, flags, options.mode );
			}
		}

		if ( isSync ) {
			if ( shouldCreateDirs ) {
				mkdirp.sync( path.dirname( src ) );
			}

			return fs.openSync( src, flags, options.mode );
		}

		return new Promise( function ( fulfil, reject ) {
			if ( shouldCreateDirs ) {
				mkdirp( path.dirname( src ), function ( err, result ) {
					if ( err ) {
						reject( err );
					} else {
						open();
					}
				});
			} else {
				open();
			}

			function open () {
				fs.open( src, flags, options.mode, function ( err, fd ) {
					if ( err ) {
						reject( err );
					} else {
						fulfil( fd );
					}
				});
			}
		});
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.mkdir and sander.mkdirSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'mkdirSync' : 'mkdir';

	method = function () {
		var dir = resolve( arguments );

		if ( isSync ) {
			return mkdirp.sync( dir );
		}

		return new Promise( function ( fulfil, reject ) {
			mkdirp( dir, function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					fulfil();
				}
			});
		});
	};

	sander[ qualifiedMethodName ] = method;
});

// sander.writeFile and sander.writeFileSync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'writeFileSync' : 'writeFile';

	method = function () {
		var data, pathargs = [], i, dest;

		i = arguments.length;
		data = arguments[ --i ];

		while ( i-- ) {
			pathargs[i] = arguments[i];
		}

		dest = resolve( pathargs );

		if ( isSync ) {
			mkdirp.sync( path.dirname( dest ) );
			return fs.writeFileSync( dest, data );
		}

		return new Promise( function ( fulfil, reject ) {
			mkdirp( path.dirname( dest ), function ( err ) {
				if ( err ) {
					reject( err );
				} else {
					fs.writeFile( dest, data, function ( err ) {
						if ( err ) {
							reject( err );
						} else {
							fulfil();
						}
					});
				}
			});
		});
	};

	sander[ qualifiedMethodName ] = method;
});

/* Extra methods */

// sander.copy, sander.copySync
[ true, false ].forEach( function ( isSync ) {
	var qualifiedMethodName, method;

	qualifiedMethodName = isSync ? 'copyFileSync' : 'copyFile';

	method = function () {
		var src, readOptions, pathargs, i;

		if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
			readOptions = arguments[ arguments.length - 1 ];

			i = arguments.length - 1;
			pathargs = [];
			while ( i-- ) {
				pathargs[i] = arguments[i];
			}
		} else {
			pathargs = arguments;
		}

		src = resolve( pathargs );

		return {
			to: function () {
				var dest, writeOptions, pathargs, i;

				if ( typeof arguments[ arguments.length - 1 ] === 'object' ) {
					writeOptions = arguments[ arguments.length - 1 ];

					i = arguments.length - 1;
					pathargs = [];
					while ( i-- ) {
						pathargs[i] = arguments[i];
					}
				} else {
					pathargs = arguments;
				}

				dest = resolve( pathargs );

				if ( isSync ) {
					data = fs.readFileSync( src, readOptions );

					mkdirp.sync( path.dirname( dest ) );
					return fs.writeFileSync( dest, data, writeOptions );
				}

				return new Promise( function ( fulfil, reject ) {
					mkdirp( path.dirname( dest ), function ( err ) {
						var readStream, writeStream;

						if ( err ) {
							reject( err );
						} else {
							readStream = fs.createReadStream( src, readOptions );
							writeStream = fs.createWriteStream( dest, writeOptions );

							readStream.on( 'error', reject );
							writeStream.on( 'error', reject );

							writeStream.on( 'close', fulfil );

							readStream.pipe( writeStream );
						}
					});
				});
			}
		};
	};

	sander[ qualifiedMethodName ] = method;
});


sander.Promise = Promise;


function resolve ( pathargs ) {
	if ( pathargs.length === 1 ) {
		return pathargs[0];
	}

	return path.resolve.apply( null, pathargs );
}
