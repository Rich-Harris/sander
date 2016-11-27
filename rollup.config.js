import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/sander.js',
	targets: [
		{ dest: 'dist/sander.cjs.js', format: 'cjs' },
		{ dest: 'dist/sander.es.js', format: 'es' },
	],
	external: [ 'graceful-fs', 'path', 'mkdirp', 'fs', 'rimraf' ],
	plugins: [ buble() ],
	sourceMap: true
};
