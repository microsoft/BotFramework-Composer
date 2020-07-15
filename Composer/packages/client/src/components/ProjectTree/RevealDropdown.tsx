// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState } from 'react';
import { jsx, css } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

type Props = {
  title: string;
  dark?: boolean;
  children?: JSX.Element;
};

const lightText = NeutralColors.white;
const darkText = NeutralColors.gray130;

const header = css`
  display: block;
  font-family: Segoe UI;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11px;
  width: 100%;
  height: 22px;
  line-height: 22px;
  padding-left: 12px;
  color: ${darkText};
  background-color: ${NeutralColors.gray50};
`;

const headerDark = css`
  ${header};
  color: ${lightText};
  background-color: ${NeutralColors.gray130};
`;

export const RevealDropdown: React.FC<Props> = (props) => {
  const [isOpen, setOpen] = useState<boolean>(true);

  return (
    <div>
      <span css={props.dark ? headerDark : header}>
        <Icon
          iconName={isOpen ? 'CaretSolidDown' : 'CaretSolidRight'}
          styles={{
            root: {
              paddingRight: '6px',
              fontSize: '11px',
              color: props.dark ? lightText : darkText,
            },
          }}
          onClick={() => setOpen(!isOpen)}
        />
        {props.title}
      </span>
      <div
        css={
          isOpen
            ? undefined
            : css`
                display: none;
              `
        }
      >
        {props.children}
      </div>
    </div>
  );
};

RevealDropdown.defaultProps = {
  dark: false,
};
