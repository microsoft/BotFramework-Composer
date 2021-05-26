// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createSvgIcon } from '@fluentui/react-icons';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';

import { defaultMenuHeight } from '../lg/constants';
import { withTooltip } from '../utils/withTooltip';

const itemButtonStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    height: defaultMenuHeight,
  },
  menuIcon: { fontSize: 8, color: NeutralColors.black },
};

const svgIconStyle = { fill: NeutralColors.black, margin: '0 4px', width: 16, height: 16 };

const popExpandSvgIcon = (
  <svg fill="none" height="16" viewBox="0 0 10 10" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.75 8.75V5.625H9.375V9.375H0.625V0.625H4.375V1.25H1.25V8.75H8.75ZM5.625 0.625H9.375V4.375H8.75V1.69434L5.21973 5.21973L4.78027 4.78027L8.30566 1.25H5.625V0.625Z"
      fill="black"
    />
  </svg>
);

export const useEditorToolbarPopExpandItem = (
  popExpandOptions?: {
    onEditorPopToggle?: (expanded: boolean) => void;
    popExpandTitle: string;
  },
  options?: {
    customClassName?: string;
  }
) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toolbarItem = React.useMemo(
    () =>
      popExpandOptions
        ? ({
            key: 'popExpandButton',
            buttonStyles: itemButtonStyles,
            className: options?.customClassName,
            onRenderIcon: () => {
              let PopExpandIcon = createSvgIcon({ svg: () => popExpandSvgIcon, displayName: 'PopExpandIcon' });
              PopExpandIcon = withTooltip({ content: formatMessage('Pop out editor') }, PopExpandIcon);
              return <PopExpandIcon style={svgIconStyle} />;
            },
            onClick: () => {
              setIsExpanded(true);
              popExpandOptions.onEditorPopToggle?.(true);
            },
          } as ICommandBarItemProps)
        : undefined,
    [popExpandOptions]
  );

  const dismiss = React.useCallback(() => {
    setIsExpanded(false);
    popExpandOptions?.onEditorPopToggle?.(false);
  }, [popExpandOptions]);

  return {
    isExpanded,
    dismiss,
    toolbarItem,
  };
};
