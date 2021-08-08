var fs = require('fs');

export function convertFileToBase64(filepath: string) {
    return fs.readFileSync(filepath, 'base64');
}