import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/sander.js',
	external: [ 'graceful-fs', 'es6-promise', 'path', 'mkdirp', 'fs', 'rimraf' ],
	plugins: [ buble() ],
	sourceMap: true
};
