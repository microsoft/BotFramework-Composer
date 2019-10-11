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
  codeRange?: ICodeRange | undefined;
}

export function BaseEditor(props: BaseEditorProps) {
  const { onChange, placeholder, value, codeRange } = props;
  const options = Object.assign({ folding: !codeRange }, defaultOptions, props.options);

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditor>(null);
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

  const updateEditorCodeRangeUI = () => {
    if (codeRange && editorRef.current) {
      const editor: any = editorRef.current.editor;
      // subtraction a hiddenAreaRange from CodeRange
      // Tips, monaco lineNumber start from 1
      const model = editor.getModel();
      const lineCount = model && model.getLineCount();
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
      editor.setHiddenAreas(hiddenRanges);
    }
  };
  useEffect(() => {
    updateEditorCodeRangeUI();
  });

  const editorDidMount = (editor, monaco) => {
    if (typeof props.editorDidMount === 'function') {
      props.editorDidMount.apply(null, [editor, monaco]);
    }
    updateEditorCodeRangeUI();
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
        ref={editorRef}
        editorDidMount={editorDidMount}
        value={value || placeholder}
        onChange={onChange}
        options={options}
      />
    </div>
  );
}

BaseEditor.defaultProps = {
  height: '100%',
  language: 'markdown',
  theme: 'vs',
};
