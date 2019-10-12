import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc';
import { start } from './server';

const reader = new StreamMessageReader(process.stdin);
const writer = new StreamMessageWriter(process.stdout);
start(reader, writer);
