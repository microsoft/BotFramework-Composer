import { transform } from '../../src';

const obiJson = require('./sample-input.json');
let result = transform(obiJson);
console.log(JSON.stringify(result, null, '\t'));
