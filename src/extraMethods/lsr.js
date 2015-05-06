import * as fs from 'graceful-fs';
import { sep } from 'path';
import resolvePath from '../utils/resolvePath';

export function lsr () {
	const basedir = resolvePath( arguments );

	let result = [];

	function processdir ( dir, cb ) {
		fs.readdir( dir, ( err, files ) => {
			if ( err ) {
				return cb( err );
			}

			let remaining = files.length;

			if ( !remaining ) {
				return cb();
			}

			files = files.map( file => dir + sep + file );

			function check ( err ) {
				if ( err ) {
					cb( err );
				}

				else if ( !--remaining ) {
					cb();
				}
			}

			files.forEach( file => {
				fs.stat( file, ( err, stats ) => {
					if ( err ) {
						cb( err );
					} else {
						if ( stats.isDirectory() ) {
							processdir( file, check );
						} else {
							result.push( file.replace( basedir + sep, '' ) );
							check();
						}
					}
				});
			});
		});
	}

	return new Promise( ( fulfil, reject ) => {
		processdir( basedir, err => {
			if ( err ) {
				reject( err );
			} else {
				fulfil( result );
			}
		});
	});
}

export function lsrSync () {
	const basedir = resolvePath( arguments );

	let result = [];

	function processdir ( dir ) {
		fs.readdirSync( dir ).forEach( file => {
			const filepath = dir + sep + file;

			if ( fs.statSync( filepath ).isDirectory() ) {
				processdir( filepath );
			} else {
				result.push( filepath.replace( basedir + sep, '' ) );
			}
		});
	}

	processdir( basedir );
	return result;
}