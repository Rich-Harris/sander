import * as fs from 'graceful-fs';
import { dirname } from 'path';
import { mkdirp, mkdirpSync } from 'mkdirp';
import resolvePath from '../utils/resolvePath';

export const rename = asyncMethod( 'rename' );
export const link = asyncMethod( 'link' );

export const renameSync = syncMethod( 'renameSync' );
export const linkSync = syncMethod( 'linkSync' );

function asyncMethod ( methodName ) {
	return function () {
		const src = resolvePath( arguments );

		return {
			to () {
				const dest = resolvePath( arguments );

				return new Promise( ( fulfil, reject ) => {
					mkdirp( dirname( dest ) )
						.then( () => {
							fs[ methodName ]( src, dest, err => {
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
	};
}

function syncMethod ( methodName ) {
	return function () {
		const src = resolvePath( arguments );

		return {
			to () {
				const dest = resolvePath( arguments );

				mkdirpSync( dirname( dest ) );
				return fs[ methodName ]( src, dest );
			}
		};
	};
}