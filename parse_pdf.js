const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'Портфолио West Arlan Group .pdf';
if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    pdf(dataBuffer).then(function(data) {
        fs.writeFileSync('portfolio_extracted.txt', data.text);
        console.log('PDF text extracted to portfolio_extracted.txt successfully.');
    }).catch(err => {
        console.error('Error parsing PDF:', err);
    });
} else {
    console.error('File not found:', pdfPath);
}
