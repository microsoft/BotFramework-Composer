// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import React, { useCallback, useEffect, useRef } from 'react';
import formatMessage from 'format-message';
import { CodeEditorSettings, LgTemplate, TelemetryClient } from '@bfc/shared';

import { withTooltip } from '../../utils/withTooltip';
import { LgCodeEditor } from '../LgCodeEditor';
import { LGOption } from '../../utils';

const removeIconClassName = 'string-array-item-remove-icon';

const Root = styled(Stack)({
  borderBottom: `1px solid ${FluentTheme.palette.neutralLight}`,
});

const TextViewItemRoot = styled(Stack)({
  transition: 'background 0.1s ease',
  '& .ms-Button:not(:focus) i': {
    visibility: 'hidden',
  },
  '&:hover .ms-Button i': {
    visibility: 'visible',
  },
  '&:hover': {
    background: FluentTheme.palette.neutralLighter,
  },
});

const Input = styled(TextField)({
  padding: '8px 0 8px 4px',
  width: '100%',
  position: 'relative',
  '& input, & textarea': {
    fontSize: FluentTheme.fonts.small.fontSize,
    maxHeight: '97px',
  },
  '& .ms-TextField-fieldGroup::after': {
    content: '""',
    position: 'absolute',
    left: -1,
    top: -1,
    right: -1,
    bottom: -1,
    pointerEvents: 'none',
    borderRadius: 2,
    border: `2px solid ${FluentTheme.palette.themePrimary}`,
    zIndex: 1,
  },
});

const LgCodeEditorContainer = styled.div({
  padding: '8px 0 8px 4px',
});

const textViewContainerStyles = {
  root: {
    height: 48,
    padding: '0 0 0 13px',
    userSelect: 'none',
    cursor: 'pointer',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

const displayTextStyles = {
  root: { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

const textViewRootTokens = { childrenGap: 8 };

const textFieldStyles = {
  fieldGroup: {
    borderColor: 'transparent',
    transition: 'border-color 0.1s linear',
    selectors: {
      ':hover': {
        borderColor: FluentTheme.palette.neutralLight,
      },
    },
  },
};

type Props = {
  mode: 'edit' | 'view';
  editorMode?: 'single' | 'editor';
  lgOption?: LGOption;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  value: string;
  codeEditorSettings?: Partial<CodeEditorSettings>;
  telemetryClient: TelemetryClient;
  removeTooltipTextContent?: string;
  onRenderDisplayText?: () => React.ReactNode;
  onBlur?: () => void;
  onJumpTo?: (direction: 'next' | 'previous') => void;
  onRemove: () => void;
  onFocus: () => void;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>, value?: string) => void;
  onLgChange?: (value: string) => void;
  onShowCallout?: (target: HTMLTextAreaElement) => void;
};

type TextViewItemProps = Pick<
  Props,
  'value' | 'onRemove' | 'onFocus' | 'onRenderDisplayText' | 'codeEditorSettings' | 'removeTooltipTextContent'
>;

const TextViewItem = React.memo(
  ({ removeTooltipTextContent, value, onRemove, onFocus, onRenderDisplayText }: TextViewItemProps) => {
    const remove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        onRemove();
      },
      [onRemove]
    );

    const focus = React.useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onFocus();
      },
      [onFocus]
    );

    const click = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onFocus();
      },
      [onFocus]
    );

    const RemoveIcon = React.useMemo(
      () => withTooltip({ content: removeTooltipTextContent ?? formatMessage('Remove variation') }, IconButton),
      [removeTooltipTextContent]
    );

    return (
      <TextViewItemRoot horizontal tokens={textViewRootTokens} verticalAlign="center">
        <Stack
          grow
          styles={textViewContainerStyles}
          tabIndex={0}
          verticalAlign="center"
          onClick={click}
          onFocus={focus}
        >
          <Text styles={displayTextStyles} variant="small">
            {onRenderDisplayText?.() ?? value.replace(/\r?\n/g, '↵')}
          </Text>
        </Stack>
        <RemoveIcon className={removeIconClassName} iconProps={{ iconName: 'Trash' }} tabIndex={-1} onClick={remove} />
      </TextViewItemRoot>
    );
  }
);

type TextFieldItemProps = Omit<Props, 'onRemove' | 'mode' | 'onFocus' | 'telemetryClient'>;

const TextFieldItem = React.memo(({ value, onShowCallout, onChange }: TextFieldItemProps) => {
  const itemRef = useRef<ITextField | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    itemRef.current?.focus();
    if (containerRef.current) {
      inputRef.current = containerRef.current.querySelector('textarea');
    }
  }, []);

  const focus = React.useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      onShowCallout?.(e.target as HTMLTextAreaElement);
    },
    [onShowCallout]
  );

  const click = React.useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      onShowCallout?.(e.target as HTMLTextAreaElement);
    },
    [onShowCallout]
  );

  return (
    <div ref={containerRef}>
      <Input
        autoAdjustHeight
        multiline
        componentRef={(ref) => (itemRef.current = ref)}
        defaultValue={value}
        resizable={false}
        styles={textFieldStyles}
        value={value}
        onChange={onChange}
        onClick={click}
        onFocus={focus}
      />
    </div>
  );
});

export const StringArrayItem = (props: Props) => {
  const {
    editorMode = 'single',
    lgOption,
    lgTemplates,
    memoryVariables,
    mode,
    onRenderDisplayText,
    onChange,
    onLgChange = () => {},
    onShowCallout,
    onRemove,
    onFocus,
    value,
    telemetryClient,
    codeEditorSettings,
    removeTooltipTextContent,
  } = props;

  const onEditorDidMount = React.useCallback(
    (_, editor) => {
      if (editorMode === 'editor') {
        editor?.focus();
      }
    },
    [editorMode]
  );

  return (
    <Root verticalAlign="center">
      {mode === 'edit' ? (
        editorMode === 'single' ? (
          <TextFieldItem value={value} onChange={onChange} onShowCallout={onShowCallout} />
        ) : (
          <LgCodeEditorContainer>
            <LgCodeEditor
              editorDidMount={onEditorDidMount}
              editorSettings={codeEditorSettings}
              height={150}
              lgOption={lgOption}
              lgTemplates={lgTemplates}
              memoryVariables={memoryVariables}
              options={{ folding: false }}
              telemetryClient={telemetryClient}
              value={value}
              onChange={onLgChange}
            />
          </LgCodeEditorContainer>
        )
      ) : (
        <TextViewItem
          removeTooltipTextContent={removeTooltipTextContent}
          value={value}
          onFocus={onFocus}
          onRemove={onRemove}
          onRenderDisplayText={onRenderDisplayText}
        />
      )}
    </Root>
  );
};
