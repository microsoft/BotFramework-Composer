import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
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

export interface BaseEditorProps extends Omit<MonacoEditorProps, 'height'> {
  onChange: (newValue: string) => void;
  placeholder?: string;
  value?: string;
}

export default function BaseEditor(props: BaseEditorProps) {
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
      style={{ height: '100%', border: `1px solid ${NeutralColors.gray30}`, overflow: 'hidden' }}
    >
      <MonacoEditor {...props} {...rect} value={value || placeholder} onChange={onChange} options={options} />
    </div>
  );
}

BaseEditor.defaultProps = {
  height: '100%',
  language: 'markdown',
  theme: 'vs',
};
