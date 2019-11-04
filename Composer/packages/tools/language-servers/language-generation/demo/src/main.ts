(self as any).MonacoEnvironment = {
  getWorkerUrl: () => './editor.worker.bundle.js',
};
import './client.ts';
// const container = document.getElementById('container');

// // import { initClient } from './client'
// // initClient(container)

// import { createEditor, registerLGLanguage, startSampleClient } from '../../src/startSampleClient';
// registerLGLanguage();
// const editor = createEditor(container)
// startSampleClient(editor)
