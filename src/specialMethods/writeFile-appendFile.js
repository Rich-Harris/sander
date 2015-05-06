import * as fs from 'graceful-fs';
import { dirname } from 'path';
import mkdirp from 'mkdirp';
import resolvePath from '../utils/resolvePath';

export const writeFile = asyncMethod( 'writeFile' );
export const appendFile = asyncMethod( 'appendFile' );

export const writeFileSync = syncMethod( 'writeFileSync' );
export const appendFileSync = syncMethod( 'appendFileSync' );

function normaliseArguments ( args ) {
	let i = args.length;
	const data = args[ --i ];

	let pathargs = new Array( i );

	while ( i-- ) {
		pathargs[i] = args[i];
	}

	const dest = resolvePath( pathargs );

	return { dest, data };
}

function asyncMethod ( methodName ) {
	return function () {
		const { dest, data } = normaliseArguments( arguments );

		return new Promise( ( fulfil, reject ) => {
			mkdirp( dirname( dest ), err => {
				if ( err ) {
					reject( err );
				} else {
					fs[ methodName ]( dest, data, err => {
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
}

function syncMethod ( methodName ) {
	return function () {
		const { dest, data } = normaliseArguments( arguments );

		mkdirp.sync( dirname( dest ) );
		return fs[ methodName ]( dest, data );
	};
}