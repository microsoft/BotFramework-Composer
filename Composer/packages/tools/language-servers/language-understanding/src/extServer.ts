// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc';

import { start } from './LUServer';

const reader = new StreamMessageReader(process.stdin);
const writer = new StreamMessageWriter(process.stdout);
start(reader, writer);
