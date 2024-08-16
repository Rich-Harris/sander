import { rimraf as _rimraf, rimrafSync as _rimrafSync } from 'rimraf';
import resolvePath from '../utils/resolvePath';

export function rimraf () {
	const target = resolvePath( arguments );

	return _rimraf( target );
}

export function rimrafSync () {
	_rimrafSync( resolvePath( arguments ) );
}