// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useRef } from 'react';
import { startSampleClient } from '@bfc/lg-lsp/lib/startSampleClient';

// setting for inline LG template editor
export interface LGLSPEditorFile {
  uri: string;
  language: string;
  content: string;
  inline?: boolean;
  template?: {
    Name: string;
    Body: string;
  };
}

export interface LgLSPEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  helpURL?: string; //  help link show below editor
  height?: number | string;
  file: LGLSPEditorFile;
}

export function LgLSPEditor(props: LgLSPEditorProps) {
  const containerRef = useRef(null);
  const { file, height } = props;
  useEffect(() => {
    const container = containerRef.current;
    startSampleClient(container, file);
  });
  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }
    if (typeof height === 'string') {
      return height;
    }

    return `${height}px`;
  };

  return <div style={{ height: `calc(${getHeight()} - 40px)`, width: '100%' }} ref={containerRef} />;
}
