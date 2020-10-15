// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { css, jsx, SerializedStyles } from '@emotion/core';
import React, { useState } from 'react';
//import { TextField, ITextFieldStyles, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label, ILabelStyleProps, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import { IStyleFunctionOrObject } from 'office-ui-fabric-react/lib';
interface CollapsableComponentProps {
  title: string;
  titleStyle: IStyleFunctionOrObject<ILabelStyleProps, ILabelStyles>;
  containerStyle?: SerializedStyles;
}

const header = css`
  display: flex;
  margin-left: -8px;
`;

const defaultContainerStyle = css`
  margin-bottom: 27px;
`;

const CollapsableWrapper: React.FC<CollapsableComponentProps> = (props) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { title, children, titleStyle, containerStyle = defaultContainerStyle } = props;
  return (
    <div css={containerStyle}>
      <div data-is-focusable css={header}>
        <IconButton
          iconProps={{ iconName: isCollapsed ? 'ChevronRight' : 'ChevronDown' }}
          styles={{ root: { color: NeutralColors.gray150 } }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
        {title && <Label styles={titleStyle}>{title}</Label>}
      </div>
      {!isCollapsed && children}
    </div>
  );
};

export { CollapsableWrapper };
