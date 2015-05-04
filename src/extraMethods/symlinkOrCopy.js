import { stat, statSync } from '../sander';
import { copydir, copydirSync } from './copydir';
import { copyFile, copyFileSync } from './copyFile';
import { symlink, symlinkSync } from '../specialMethods/symlink';

const isWindows = process.platform === 'win32';

export function symlinkOrCopy () {
	if ( isWindows ) {
		const { resolvedPath: src, options: readOptions } = resolvePathAndOptions( arguments );

		return stat( src )
			.then( stats => {
				return ( stats.isDirectory() ? copydir : copyFile ).apply( null, arguments );
			});
	}

	return symlink.apply( null, arguments );
}

export function symlinkOrCopySync () {
	if ( isWindows ) {
		const { resolvedPath: src, options: readOptions } = resolvePathAndOptions( arguments );
		( statSync( src ).isDirectory() ? copydirSync : copyFileSync ).apply( null, arguments );
	}

	return symlinkSync.apply( null, arguments );
}