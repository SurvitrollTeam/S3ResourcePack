const JSZip = require("jszip");
const fs = require('fs'), crypto = require('crypto');
const { basename, join, relative } = require('path');
const FILE = 'rp-production';

const { tempDir, outputDir } = require('./config');
const OUT = outputDir();
if (fs.existsSync(OUT)) {
	console.log(`🗑️  Deleting ${basename(OUT)}`);
	fs.rmSync(OUT, { recursive: true, force: true });
}
fs.mkdirSync(OUT);

console.log("📦 Bundling files...");
const zip = new JSZip();
for (const path of getFilesRecursive(tempDir()))
	zip.file(relative(tempDir(), path), fs.readFileSync(path));

console.log("📄 Writting file...");
zip.generateAsync({ type: 'nodebuffer' }).then(data => {
	fs.writeFileSync(join(OUT, `${FILE}.zip`), data);
	console.log("🔗 Generating Hash...");
	const sum = crypto.createHash('sha1')
		.update(data).digest('hex').toUpperCase();
	fs.writeFileSync(join(outputDir(), `${FILE}.sha1`), sum);
	console.log("🔗 Checksum:", sum);
	console.log("🔍 Cleaning project");
	fs.rmSync(tempDir(), { recursive: true, force: true });
	console.log("✅ Operation Complete!");
});


function getFilesRecursive(folder) {
	const files = [];
	fs.readdirSync(folder).forEach(child => {
		const file = join(folder, child);
		if (fs.lstatSync(file).isDirectory()) files.push(...getFilesRecursive(file));
		else files.push(file);
	});
	return files;
}