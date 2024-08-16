import { mkdirp, mkdirpSync } from 'mkdirp';
import resolvePath from '../utils/resolvePath';

export function mkdir () {
	const dir = resolvePath( arguments );

	return new Promise( ( fulfil, reject ) => {
		mkdirp( dir )
			.then( () => {
				fulfil();
			})
			.catch( reject );
	});
}

export function mkdirSync () {
	const dir = resolvePath( arguments );
	mkdirpSync( dir );
}