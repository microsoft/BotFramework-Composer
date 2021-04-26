// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useState } from 'react';

import { tableColumnHeader, tableRow, tableRowItem } from '../../../botProject/styles';
import { ContentProps } from '../constants';

const header = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

const addNewAllowCallers = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    marginLeft: 5,
  },
};

const removeCaller = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
    paddingBottom: 5,
  },
};

export const AddCallers: React.FC<ContentProps> = ({ projectId, callers, onUpdateCallers }) => {
  const handleRemove = (index) => {
    onUpdateCallers(callers.filter((_, i) => i !== index));
    setFocusCallerIndex(undefined);
  };
  const handleAddNewAllowedCallerClick = () => {
    const currentCallers = callers.slice();
    currentCallers?.push('');
    onUpdateCallers(currentCallers);
    setFocusCallerIndex(currentCallers.length - 1);
  };

  const [focusCallerIndex, setFocusCallerIndex] = useState<number | undefined>(0);

  return (
    <div>
      <div css={header}>
        <div css={tableColumnHeader()}>{formatMessage('Allowed Callers')}</div>
      </div>
      {callers?.map((caller, index) => {
        return (
          <div key={index} css={tableRow}>
            <div css={tableRowItem('90%')} title={caller}>
              <TextField
                borderless={focusCallerIndex !== index}
                value={caller}
                onBlur={(_) => {
                  if (focusCallerIndex === index) {
                    setFocusCallerIndex(undefined);
                  }
                }}
                onChange={(e, newValue) => {
                  const currentCallers = callers.slice();
                  currentCallers[index] = newValue ?? '';
                  onUpdateCallers(currentCallers);
                }}
                onFocus={() => {
                  setFocusCallerIndex(index);
                }}
              />
            </div>
            <div css={tableRowItem('10%')}>
              <ActionButton styles={removeCaller} onClick={() => handleRemove(index)}>
                {formatMessage('Remove')}
              </ActionButton>
            </div>
          </div>
        );
      })}
      <ActionButton styles={addNewAllowCallers} onClick={handleAddNewAllowedCallerClick}>
        {formatMessage('Add allowed callers')}
      </ActionButton>
    </div>
  );
};
