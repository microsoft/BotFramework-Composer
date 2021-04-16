// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';

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
  };
  const handleAddNewAllowedCallerClick = () => {
    const currentCallers = callers.slice();
    currentCallers?.push('0000-11111-00000-11111');
    onUpdateCallers(currentCallers);
  };

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
                borderless
                value={caller}
                onChange={(e, newValue) => {
                  const currentCallers = callers.slice();
                  currentCallers[index] = newValue ?? '';
                  onUpdateCallers(currentCallers);
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
