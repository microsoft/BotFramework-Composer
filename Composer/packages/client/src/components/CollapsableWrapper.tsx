// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/core';
import React, { useState } from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

type CollapsableComponentProps = {
  title: string;
  titleStyle: SerializedStyles;
  containerStyle?: SerializedStyles;
};

const header = css`
  display: flex;
  margin-left: -8px;
`;

const defaultContainerStyle = css`
  margin-bottom: 27px;
`;

export const CollapsableWrapper: React.FC<CollapsableComponentProps> = (props) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { title, children, titleStyle, containerStyle = defaultContainerStyle } = props;
  return (
    <div css={containerStyle}>
      <div data-is-focusable aria-label={title} css={header}>
        <IconButton
          ariaLabel={isCollapsed ? formatMessage('Expand') : formatMessage('Collapse')}
          iconProps={{ iconName: isCollapsed ? 'ChevronRight' : 'ChevronDown' }}
          styles={{ root: { color: NeutralColors.gray150 } }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
        <div css={titleStyle}>{title}</div>
      </div>
      {!isCollapsed && children}
    </div>
  );
};
