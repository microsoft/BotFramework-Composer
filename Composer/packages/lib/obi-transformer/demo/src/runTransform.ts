import { transform } from '../../src';

const obiJson = require('./sample.json');
let result = transform(obiJson);
console.log('result: ', result);
