// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

process.env.COMPOSER_EXTENSION_MANIFEST = path.resolve(__dirname, '__manifest__.json');
process.env.COMPOSER_BUILTIN_EXTENSIONS_DIR = path.resolve(__dirname, '__builtin__');
process.env.COMPOSER_REMOTE_EXTENSIONS_DIR = path.resolve(__dirname, '__remote__');
