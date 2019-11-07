// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import * as monacoEditor from 'monaco-editor-core';
import throttle from 'lodash.throttle';

import { MonacoEditorCoreProps } from './interface';
import { MonacoEditorCore } from './MonacoEditorCore';

const defaultOptions: monacoEditor.editor.IEditorConstructionOptions = {
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  fontFamily: 'Segoe UI',
  fontSize: 14,
  lineNumbers: 'off',
  quickSuggestions: false,
  minimap: {
    enabled: false,
  },
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 0,
  glyphMargin: false,
  folding: false,
  renderLineHighlight: 'none',
};

export interface BaseEditorCoreProps extends Omit<MonacoEditorCoreProps, 'height'> {
  onChange: (newValue: string) => void;
  placeholder?: string;
  value?: string;
}

export function BaseEditorCore(props: BaseEditorCoreProps) {
  const { onChange, placeholder, value } = props;
  const options = Object.assign({}, defaultOptions, props.options);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({ height: 0, width: 0 });

  const updateRect = throttle(() => {
    if (containerRef.current) {
      const { height, width } = containerRef.current.getBoundingClientRect();

      if (height !== rect.height || (width !== rect.width && height + width > 0)) {
        requestAnimationFrame(() => {
          setRect({ height, width });
        });
      } else if (height + width === 0) {
        // try again
        setTimeout(updateRect, 50);
      }
    }
  }, 0);

  useEffect(() => {
    window.addEventListener('resize', updateRect);

    return () => {
      window.addEventListener('resize', updateRect);
    };
  }, []);

  useLayoutEffect(() => {
    updateRect();
  }, []);

  return (
    <div
      className="CodeEditor"
      ref={containerRef}
      style={{
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <MonacoEditorCore {...props} {...rect} value={value || placeholder} onChange={onChange} options={options} />
    </div>
  );
}

BaseEditorCore.defaultProps = {
  height: '100%',
  language: 'markdown',
  theme: 'vs',
};
