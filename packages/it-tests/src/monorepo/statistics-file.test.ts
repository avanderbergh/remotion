import {expect, test} from 'bun:test';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {Pkgs, descriptions, getAllPackages} from './get-all-packages';

test('All packages should have a README.md file', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	const readmePath = join(process.cwd(), '..', 'STATS.md');

	const readme =
		[
			`# Download statistics`,
			'Monthly downloads of Remotion packages',
			dirs
				.map(({pkg}) => {
					const name = pkg === 'core' ? 'remotion' : `@remotion/${pkg}`;
					const description = descriptions[pkg as Pkgs];
					if (!description) {
						return null;
					}

					return `[![NPM Downloads](https://img.shields.io/npm/dm/${name}.svg?style=flat&color=black&label=${name})](https://npmcharts.com/compare/${name}?minimal=true)  `;
				})
				.filter(Boolean)
				.join('\n'),
		]
			.filter(Boolean)
			.join('\n') + '\n';

	writeFileSync(readmePath, readme);
});
