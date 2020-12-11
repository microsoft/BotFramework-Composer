// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { lgImportResolverGenerator } from '@bfc/shared';
import { lgUtil } from '@bfc/indexers';

import { WorkerMsg } from './lgParser';

process.on('message', (msg: WorkerMsg) => {
  try {
    switch (msg.type) {
      case 'parse': {
        const { id, content, lgFiles } = msg.payload;
        const { templates, allTemplates, diagnostics } = lgUtil.parse(id, content, lgFiles);
        process.send?.({ id: msg.id, payload: { id, content, templates, allTemplates, diagnostics } });
        break;
      }

      case 'updateTemplate': {
        const { lgFile, templateName, template, lgFiles } = msg.payload;
        const lgImportResolver = lgImportResolverGenerator(lgFiles, '.lg');
        const { id, content, templates, allTemplates, diagnostics } = lgUtil.updateTemplate(
          lgFile,
          templateName,
          template,
          lgImportResolver
        );
        process.send?.({ id: msg.id, payload: { id, content, templates, allTemplates, diagnostics } });
        break;
      }
    }
  } catch (error) {
    process.send?.({ id: msg.id, error });
  }
});
