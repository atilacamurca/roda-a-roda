const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const accents = require('remove-accents');

function parseFile(filename) {
    const content = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
    const split = content.trim().split(/\r?\n/).map(value => accents.remove(value));
    const filtered = _.filter(split, value => value.length < 10)
    return _.chunk(_.shuffle(filtered), 3);
}

const frutasArray = parseFile('frutas.txt');
const animaisArray = parseFile('animais.txt');
const legumesArray = parseFile('legumes.txt');
const sentimentosArray = parseFile('sentimentos.txt');

console.log('     n. frutas: ', frutasArray.length)
console.log('    n. animais: ', animaisArray.length)
console.log('    n. legumes: ', legumesArray.length)
console.log('n. sentimentos: ', sentimentosArray.length)
console.log('      n. total: ', frutasArray.length + animaisArray.length + legumesArray.length + sentimentosArray.length)

const questions = []
frutasArray.forEach(value => {
    questions.push({
        clue: 'Frutas',
        phrase: value.join(' ')
    });
});

animaisArray.forEach(value => {
    questions.push({
        clue: 'Animais',
        phrase: value.join(' ')
    });
});

legumesArray.forEach(value => {
    questions.push({
        clue: 'Legumes / Verduras',
        phrase: value.join(' ')
    });
});

sentimentosArray.forEach(value => {
    questions.push({
        clue: 'Sentimentos',
        phrase: value.join(' ')
    });
});

fs.writeFileSync(path.join(__dirname, 'questions.json'), JSON.stringify(_.shuffle(questions)))
