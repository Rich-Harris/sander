import * as fs from 'fs';
import resolvePath from '../utils/resolvePath';
import resolvePathAndOptions from '../utils/resolvePathAndOptions';

export function symlink () {
	const src = resolvePath( arguments );

	return {
		to () {
			const { options, resolved: dest } = resolvePathAndOptions( arguments );

			return new Promise( ( fulfil, reject ) => {
				fs.symlink( src, dest, options.type, err => {
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

export function symlinkSync () {
	const src = resolvePath( arguments );

	return {
		to () {
			const { options, resolved: dest } = resolvePathAndOptions( arguments );
			return fs.symlinkSync( src, dest, options.type );
		}
	};
}