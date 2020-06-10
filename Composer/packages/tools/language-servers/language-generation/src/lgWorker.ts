// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { parentPort } from 'worker_threads';

import { Templates, Diagnostic } from 'botbuilder-lg';
import { importResolverGenerator } from '@bfc/shared';

import { WorkerMsg } from './lgParser';

function createDiagnostic(diagnostic: Diagnostic) {
  const { code, range, severity, source, message } = diagnostic;
  const { start, end } = range;
  return {
    code,
    range: {
      start: { line: start.line, character: start.character },
      end: { line: end.line, character: end.character },
    },
    severity,
    source,
    message,
  };
}

if (!parentPort) {
  process.exit();
}

parentPort.on('message', (message: WorkerMsg) => {
  const { content, id, resources } = message.payload;
  let templates: any[] = [];
  let diagnostics: any[] = [];
  try {
    const resolver = importResolverGenerator(resources, '.lg');
    const { allTemplates, allDiagnostics } = Templates.parseText(content, id, resolver);
    templates = allTemplates.map((item) => ({ name: item.name, parameters: item.parameters, body: item.body }));
    diagnostics = allDiagnostics.map((item) => createDiagnostic(item));
    parentPort?.postMessage({ id: message.id, payload: { templates, diagnostics } });
  } catch (error) {
    parentPort?.postMessage({ id: message.id, error });
  }
});
