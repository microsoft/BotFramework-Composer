import React, { useEffect, useRef } from 'react';

import {
  createEditor,
  startSampleClient,
  registerLGLanguage,
} from '../../../../tools/language-servers/language-generation/src/startSampleClient';

const content = `# Greeting
-Good morning
-Good afternoon
-Good evening`;

registerLGLanguage();

export default function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    const editor = createEditor(containerRef.current);
    startSampleClient(editor);
  });

  return <div style={{ height: '99vh', width: '100%' }} ref={containerRef} />;
}
