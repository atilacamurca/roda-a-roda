const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const accents = require('remove-accents');

function parseFile(filename) {
    const content = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
    const split = content.trim().split(/\r?\n/).map(value => accents.remove(value));
    return _.chunk(_.shuffle(split), 3);
}

const frutasArray = parseFile('frutas.txt');
console.log(frutasArray)

const animaisArray = parseFile('animais.txt');
console.log(animaisArray)

const legumesArray = parseFile('legumes.txt');
console.log(legumesArray)

console.log(' n. frutas: ', frutasArray.length)
console.log('n. animais: ', animaisArray.length)
console.log('n. legumes: ', legumesArray.length)
console.log('  n. total: ', frutasArray.length + animaisArray.length + legumesArray.length)
