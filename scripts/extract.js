const fs = require('fs');
const { basename, join, dirname } = require('path');
const JSZip = require("jszip");

const { sources, tempDir } = require('./config');
const TMP = tempDir();
if (fs.existsSync(TMP)) {
	console.log(`🗑️  Deleting ${basename(TMP)}/`);
	fs.rmSync(TMP, { recursive: true, force: true });
}

for (const { path, type } of sources()) {
	const name = basename(path);
	switch (type) {
		case 'folder':
			console.log(`📋 Copying ${name}/'s content into ${basename(TMP)}`);
			copyFolderContent(path, TMP);
			break;
		case 'zip':
			console.log(`📦 Extracting ${name} into ${basename(TMP)}`);
			extract(path, TMP);
			break;
		default:
			console.log(`❌ Unable to read ${name}: Invalid source type (${type})`);
	}
}

console.log('✅ Operation complete!');

function extract(zipFile, outputDir) {
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

	fs.readFile(zipFile, async (err, data) => {
		if (err) return console.error(err);
		const zip = await JSZip.loadAsync(data);
		for (const file in zip.files) {
			const data = await zip.file(file).async('nodebuffer'),
				path = join(outputDir, file);
			fs.mkdirSync(dirname(path), { recursive: true });
			fs.writeFileSync(path, data);
		}
	});
}

function copyFolderContent(inputDir, outputDir) {
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
	const dir = fs.readdirSync(inputDir);
	dir.forEach(file => {
		const child = join(inputDir, file), target = join(outputDir, file);
		if (fs.lstatSync(child).isDirectory()) copyFolderContent(child, target);
		else fs.copyFileSync(child, target);
	});
}