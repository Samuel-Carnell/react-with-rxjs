import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from './package.json';
import { resolve } from 'path';

const peerDependencies = pkg.config.lib.peerDependencies.reduce((peerDependencies, packageName) => {
	if (Object.keys(pkg.dependencies).includes(packageName)) {
		return {
			...peerDependencies,
			[packageName]: pkg.dependencies[packageName],
		};
	}

	if (Object.keys(pkg.devDependencies).includes(packageName)) {
		return {
			...peerDependencies,
			[packageName]: pkg.devDependencies[packageName],
		};
	}

	console.warn(
		'Cannot include ' + packageName + ' as a peer dependency. Unable to find package version.'
	);
	return peerDependencies;
}, {});

console.log('Generated peer dependencies:\n' + JSON.stringify(peerDependencies));

export default [
	{
		input: 'src/index.ts',
		external: ['react', 'rxjs', 'rxjs/operators'],
		plugins: [
			del({ targets: 'dist/*' }),
			typescript({
				typescript: require('typescript'),
			}),
			copy({
				targets: [
					{ src: 'README.md', dest: 'dist' },
					{ src: 'CHANGELOG.md', dest: 'dist' },
				],
			}),
			generatePackageJson({
				baseContents: (pkg) => ({
					...pkg,
					name: pkg.name,
					scripts: undefined,
					dependencies: {},
					devDependencies: {},
					peerDependencies,
					private: false,
					config: undefined,
				}),
			}),
			terser(),
		],
		output: [
			{
				name: pkg.name,
				file: `dist/${pkg.main}`,
				format: 'umd',
				globals: {
					react: 'react',
				},
				sourcemap: true,
			},
			{ file: `dist/${pkg.module}`, format: 'es', sourcemap: true },
		],
	},
];
