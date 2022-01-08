const { join, resolve } = require('path'), { readFileSync } = require('fs');
const root = process.cwd(), config = JSON.parse(readFileSync(join(root, 'config.json')));

module.exports = {
	outputDir: () => resolve(root, config.outputDir),
	tempDir: () => resolve(root, config.tempDir),
	sources: () => config.sources.map(({ path, type }) => ({
		path: resolve(path), type
	}))
};