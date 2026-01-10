// Load in dependencies
import { readdirSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import Spritesmith from 'spritesmith';
// @ts-expect-error: missing upstream types
import templater from 'spritesheet-templates';

const ctr = 'src/webfiles/ctr';
const ctr_images = ctr + '/images';
const sprite_paths = readdirSync(ctr_images + '/sprites')
	.filter(path => path.endsWith('.png'))
	.map(path => ctr_images + '/sprites/' + path);

// Generate our spritesheet
Spritesmith.run({
	src: sprite_paths
}, function handleResult(err, result) {
	if (err) {
		console.error(err);
		return;
	}
	const { coordinates, properties, image } = result;

	const sprites = Object.entries(coordinates).map(([name, coords]) => {
		return {
			name: basename(name, '.png'),
			...coords
		};
	});

	const res = templater({
		sprites,
		spritesheet: {
			...properties,
			image: '/images/sprites.png'
		}
	}, {
		format: 'css',
		formatOpts: {
			cssSelector: ({ name }: { name: string }) => {
				/* Use underscore for :checked, :hover etc. */
				return '.sprite-' + name.replaceAll('_', ':');
			}
		}
	});

	writeFileSync(ctr + '/css/sprites.css', res, {
		encoding: 'utf-8'
	});
	writeFileSync(ctr + '/images/sprites.png', image);
	console.info(`success: wrote ${sprite_paths.length} sprites`);
});
