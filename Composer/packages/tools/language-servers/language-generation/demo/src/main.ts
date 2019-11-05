(self as any).MonacoEnvironment = {
  getWorkerUrl: () => './editor.worker.bundle.js',
};
// import './client.ts';
import { startSampleClient } from '../../src/startSampleClient';
// import { startSampleClient } from '@bfc/lg-lsp';

const container = document.getElementById('container');

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening

# Greeting4
-Good midnight`;

// Body will fill in editor
const template = {
  Name: 'Greeting2',
  Body: `-Good afternoon
-[Greeting3]
-[Greeting4]`,
};
// setting for inline LG template editor
const file = {
  uri: 'inmemory://common2.lg',
  language: 'botbuilderlg',
  content,
  template,
};

startSampleClient(container, file);
