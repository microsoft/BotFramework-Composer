// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { importResolverGenerator } from '@bfc/shared';
import { lgIndexer } from '@bfc/indexers';

import { WorkerMsg } from './lgParser';

process.on('message', (message: WorkerMsg) => {
  const { content, id, resources } = message.payload;

  try {
    const lgImportResolver = importResolverGenerator(resources, '.lg');
    const { templates, allTemplates, diagnostics } = lgIndexer.parse(content, id, lgImportResolver);
    process.send?.({ id: message.id, payload: { id, content, templates, allTemplates, diagnostics } });
  } catch (error) {
    process.send?.({ id: message.id, error });
  }
});
