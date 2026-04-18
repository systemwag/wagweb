const fs = require('fs');
const path = require('path');

const destDir = path.join('z:', 'WAG', 'WagWebpage', 'generated_images');
console.log('Creating directory...', destDir);
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = [
    { src: 'C:\\Users\\Turing\\.gemini\\antigravity\\brain\\04d132b4-b946-47b5-855a-23b85bff3add\\surveying_engineers_1_1775634193144.png', dest: '1.png' },
    { src: 'C:\\Users\\Turing\\.gemini\\antigravity\\brain\\04d132b4-b946-47b5-855a-23b85bff3add\\railway_design_team_2_1775634212350.png', dest: '2.png' },
    { src: 'C:\\Users\\Turing\\.gemini\\antigravity\\brain\\04d132b4-b946-47b5-855a-23b85bff3add\\surveyors_work_3_1775634228636.png', dest: '3.png' }
];

files.forEach(f => {
    const destPath = path.join(destDir, f.dest);
    console.log(`Copying to ${f.dest}...`);
    try {
        fs.copyFileSync(f.src, destPath);
    } catch (e) {
        console.error('Error copying file:', e.message);
    }
});
console.log('Done!');
