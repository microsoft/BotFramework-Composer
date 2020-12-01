// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import React, { useCallback, useMemo } from 'react';
import { builtInFunctionsGrouping, getBuiltInFunctionInsertText } from '@bfc/built-in-functions';

import { expressionGroupingsToMenuItems } from './utils/expressionsListMenuUtils';

const componentMaxHeight = 400;

type ExpressionsListMenuProps = {
  onExpressionSelected: (expression: string) => void;
  onMenuMount: (menuContainerElms: HTMLDivElement[]) => void;
};
export const ExpressionsListMenu = (props: ExpressionsListMenuProps) => {
  const { onExpressionSelected, onMenuMount } = props;

  const containerRef = React.createRef<HTMLDivElement>();

  const onExpressionKeySelected = useCallback(
    (key) => {
      const insertText = getBuiltInFunctionInsertText(key);
      onExpressionSelected('= ' + insertText);
    },
    [onExpressionSelected]
  );

  const onLayerMounted = useCallback(() => {
    const elms = document.querySelectorAll<HTMLDivElement>('.ms-ContextualMenu-Callout');
    onMenuMount(Array.prototype.slice.call(elms));
  }, [onMenuMount]);

  const menuItems = useMemo(
    () =>
      expressionGroupingsToMenuItems(
        builtInFunctionsGrouping,
        onExpressionKeySelected,
        onLayerMounted,
        componentMaxHeight
      ),
    [onExpressionKeySelected, onLayerMounted]
  );

  return (
    <div ref={containerRef}>
      <ContextualMenu
        calloutProps={{
          onLayerMounted: onLayerMounted,
        }}
        directionalHint={DirectionalHint.bottomLeftEdge}
        hidden={false}
        items={menuItems}
        shouldFocusOnMount={false}
        styles={{
          container: { maxHeight: componentMaxHeight },
        }}
        target={containerRef}
      />
    </div>
  );
};
