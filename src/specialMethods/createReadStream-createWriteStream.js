import * as fs from 'graceful-fs';
import { dirname } from 'path';
import { mkdirpSync } from 'mkdirp';
import resolvePathAndOptions from '../utils/resolvePathAndOptions';

export function createReadStream () {
	const { resolvedPath, options } = resolvePathAndOptions( arguments );
	return fs.createReadStream( resolvedPath, options );
}

export function createWriteStream () {
	const { resolvedPath, options } = resolvePathAndOptions( arguments );

	mkdirpSync( dirname( resolvedPath ) );
	return fs.createWriteStream( resolvedPath, options );
}