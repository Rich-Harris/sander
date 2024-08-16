import { dirname } from 'path';
import * as fs from 'graceful-fs';
import { mkdirp, mkdirpSync } from 'mkdirp';
import resolvePath from '../utils/resolvePath';
import resolvePathAndOptions from '../utils/resolvePathAndOptions';

export function symlink () {
	const src = resolvePath( arguments );

	return {
		to () {
			const { options, resolvedPath: dest } = resolvePathAndOptions( arguments );

			return new Promise( ( fulfil, reject ) => {
				mkdirp( dirname( dest ) )
					.then( () => {
						fs.symlink( src, dest, options.type, err => {
							if ( err ) {
								reject( err );
							} else {
								fulfil();
							}
						});
					})
					.catch( reject );
			});
		}
	};
}

export function symlinkSync () {
	const src = resolvePath( arguments );

	return {
		to () {
			const { options, resolvedPath: dest } = resolvePathAndOptions( arguments );
			mkdirpSync( dirname( dest ) );
			return fs.symlinkSync( src, dest, options.type );
		}
	};
}