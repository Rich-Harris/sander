import { sep } from 'path';
import * as fs from 'graceful-fs';
import { mkdirp , mkdirpSync} from 'mkdirp';
import resolvePathAndOptions from '../utils/resolvePathAndOptions';

export function copydir () {
	const { resolvedPath: src, options: readOptions } = resolvePathAndOptions( arguments );

	return {
		to () {
			const { resolvedPath: dest, options: writeOptions } = resolvePathAndOptions( arguments );

			function copydir ( src, dest, cb ) {
				mkdirp( dest )
					.then( () => {
						fs.readdir( src, ( err, files ) => {
							if ( err ) return cb( err );

							let remaining = files.length;

							if ( !remaining ) return cb();

							function check ( err ) {
								if ( err ) {
									return cb( err );
								}

								if ( !--remaining ) {
									cb();
								}
							}

							files.forEach( function ( filename ) {
								const srcpath = src + sep + filename;
								const destpath = dest + sep + filename;

								fs.stat( srcpath, ( err, stats ) => {
									var readStream, writeStream;

									if ( stats.isDirectory() ) {
										return copydir( srcpath, destpath, check );
									}

									readStream = fs.createReadStream( srcpath, readOptions );
									writeStream = fs.createWriteStream( destpath, writeOptions );

									readStream.on( 'error', cb );
									writeStream.on( 'error', cb );

									writeStream.on( 'close', check );

									readStream.pipe( writeStream );
								});
							});
						});
					})
					.catch(cb);
			}

			return new Promise( ( fulfil, reject ) => {
				copydir( src, dest, err => {
					if ( err ) {
						reject( err );
					} else {
						fulfil();
					}
				});
			});
		}
	};
}

export function copydirSync () {
	const { resolvedPath: src, options: readOptions } = resolvePathAndOptions( arguments );

	return {
		to () {
			const { resolvedPath: dest, options: writeOptions } = resolvePathAndOptions( arguments );

			function copydir ( src, dest ) {
				mkdirpSync( dest );

				fs.readdirSync( src ).forEach( filename => {
					const srcpath = src + sep + filename;
					const destpath = dest + sep + filename;

					if ( fs.statSync( srcpath ).isDirectory() ) {
						return copydir( srcpath, destpath );
					}

					const data = fs.readFileSync( srcpath, readOptions );
					fs.writeFileSync( destpath, data, writeOptions );
				});
			}

			copydir( src, dest );
		}
	};
}