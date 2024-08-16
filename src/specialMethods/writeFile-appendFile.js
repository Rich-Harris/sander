import * as fs from 'graceful-fs';
import { dirname } from 'path';
import { mkdirp, mkdirpSync } from 'mkdirp';
import resolvePath from '../utils/resolvePath';

export const writeFile = asyncMethod( 'writeFile' );
export const appendFile = asyncMethod( 'appendFile' );

export const writeFileSync = syncMethod( 'writeFileSync' );
export const appendFileSync = syncMethod( 'appendFileSync' );

function normaliseArguments ( args ) {
	args = Array.prototype.slice.call( args, 0 );
	let opts = {};

	if ( typeof args[ args.length - 1 ] === 'object' && !( args[ args.length - 1 ] instanceof Buffer ) ) {
		opts = args.pop();
	}

	return { opts, data: args.pop(), dest: resolvePath( args ) };
}

function asyncMethod ( methodName ) {
	return function () {
		const { dest, data, opts } = normaliseArguments( arguments );

		return new Promise( ( fulfil, reject ) => {
			mkdirp( dirname( dest ) )
				.then( () => {
					fs[ methodName ]( dest, data, opts, err => {
						if ( err ) {
							reject( err );
						} else {
							fulfil( data );
						}
					});
				})
				.catch( reject );
		});
	};
}

function syncMethod ( methodName ) {
	return function () {
		const { dest, data } = normaliseArguments( arguments );

		mkdirpSync( dirname( dest ) );
		return fs[ methodName ]( dest, data );
	};
}
