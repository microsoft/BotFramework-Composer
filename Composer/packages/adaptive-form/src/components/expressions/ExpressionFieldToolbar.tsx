// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import React from 'react';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { FieldToolbar } from '@bfc/code-editor';
import { useShellApi } from '@bfc/extension-client';

const inputs = ['input', 'textarea'];

type Props = {
  container: HTMLDivElement | null;
  target: HTMLInputElement | HTMLTextAreaElement | null;
  value?: string;
  onChange: (expression: string) => void;
  onClearTarget: () => void;
};

const jsFieldToolbarMenuClassName = 'js-field-toolbar-menu';

export const ExpressionFieldToolbar = (props: Props) => {
  const { onClearTarget, container, target, value = '', onChange } = props;
  const { projectId, shellApi } = useShellApi();

  const [memoryVariables, setMemoryVariables] = React.useState<string[] | undefined>();

  React.useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        const variables = await shellApi.getMemoryVariables(projectId, { signal: abortController.signal });
        setMemoryVariables(variables);
      } catch (e) {
        // error can be due to abort
      }
    })();
  }, [projectId]);

  React.useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        (!document.activeElement || inputs.includes(document.activeElement.tagName.toLowerCase()))
      ) {
        onClearTarget();
      }
    };

    const focusHandler = (e: FocusEvent) => {
      if (container?.contains(e.target as Node)) {
        return;
      }

      if (
        !e
          .composedPath()
          .filter((n) => n instanceof Element)
          .map((n) => (n as Element).className)
          .some((c) => c.indexOf(jsFieldToolbarMenuClassName) !== -1)
      ) {
        onClearTarget();
      }
    };

    document.addEventListener('focusin', focusHandler);
    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('focusin', focusHandler);
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [container, onClearTarget]);

  const onSelectToolbarMenuItem = React.useCallback(
    (text: string) => {
      if (typeof target?.selectionStart === 'number') {
        const start = target.selectionStart;
        const end = typeof target?.selectionEnd === 'number' ? target.selectionEnd : target.selectionStart;

        const updatedItem = [value.slice(0, start), text, value.slice(end)].join('');
        onChange(updatedItem);

        setTimeout(() => {
          target.setSelectionRange(updatedItem.length, updatedItem.length);
        }, 0);
      }

      target?.focus();
    },
    [target, value, onChange]
  );
  return target ? (
    <Callout
      doNotLayer
      directionalHint={DirectionalHint.topLeftEdge}
      gapSpace={2}
      isBeakVisible={false}
      target={target}
    >
      <FieldToolbar
        key="field-toolbar"
        dismissHandlerClassName={jsFieldToolbarMenuClassName}
        excludedToolbarItems={['template']}
        properties={memoryVariables}
        onSelectToolbarMenuItem={onSelectToolbarMenuItem}
      />
    </Callout>
  ) : null;
};
