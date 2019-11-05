import React, { useEffect, useRef } from 'react';

import { startSampleClient } from '../../../../tools/language-servers/language-generation/src/startSampleClient';

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

// Body will fill in editor
const template = {
  Name: 'Greeting2',
  Body: `-Good afternoon
-[Greeting3]
-[Greeting4]`,
};
// setting for inline LG template editor
const file = {
  uri: 'inmemory://common.lg',
  language: 'botbuilderlg',
  content,
  template,
};

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const editor = startSampleClient(container, file);
    // startSampleClient(editor);
  });

  return <div style={{ height: '99vh', width: '100%' }} ref={containerRef} />;
}
