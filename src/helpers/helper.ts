var fs = require('fs');

export function convertFileToBase64(filepath: string) {
    return fs.readFileSync(filepath, 'base64');
}

export function firstLetterUpper(input: string) {
    input = input?.toLowerCase();
    return input.charAt(0).toUpperCase() + input.slice(1);
}