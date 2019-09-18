import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import MonacoEditor, { MonacoEditorProps } from '@bfcomposer/react-monaco-editor';
import throttle from 'lodash.throttle';

const defaultOptions = {
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  fontFamily: 'Segoe UI',
  fontSize: 14,
  lineNumbers: 'off',
  quickSuggestions: false,
  minimap: {
    enabled: false,
  },
};

interface ICodeRange {
  startLineNumber: number;
  endLineNumber: number;
}

export interface BaseEditorProps extends Omit<MonacoEditorProps, 'height'> {
  onChange: (newValue: string) => void;
  placeholder?: string;
  value?: string;
  codeRange?: ICodeRange;
}

export function BaseEditor(props: BaseEditorProps) {
  const { onChange, placeholder, value, codeRange } = props;
  const options = Object.assign({ folding: !codeRange }, defaultOptions, props.options);

  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({ height: 0, width: 0 });

  const updateRect = throttle(() => {
    if (containerRef.current) {
      const { height, width } = containerRef.current.getBoundingClientRect();

      if (height !== rect.height || (width !== rect.width && height + width > 0)) {
        requestAnimationFrame(() => {
          setRect({ height, width });
        });
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

  const editorDidMount = ref => {
    if (codeRange) {
      // subtraction a hiddenAreaRange from CodeRange
      // Tips, monaco lineNumber start from 1
      const lineCount = ref.getModel().getLineCount();
      const hiddenRanges = [
        {
          startLineNumber: 1,
          endLineNumber: codeRange.startLineNumber - 1,
        },
        {
          startLineNumber: codeRange.endLineNumber + 1,
          endLineNumber: lineCount,
        },
      ];

      if (codeRange.startLineNumber === 1) {
        hiddenRanges.shift();
      }
      if (codeRange.endLineNumber === lineCount) {
        hiddenRanges.pop();
      }

      ref.setHiddenAreas(hiddenRanges);
    }
  };

  return (
    <div
      className="CodeEditor"
      ref={containerRef}
      style={{
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <MonacoEditor
        {...props}
        {...rect}
        value={value || placeholder}
        onChange={onChange}
        options={options}
        editorDidMount={editorDidMount}
      />
    </div>
  );
}

BaseEditor.defaultProps = {
  height: '100%',
  language: 'markdown',
  theme: 'vs',
};
