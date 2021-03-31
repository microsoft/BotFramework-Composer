// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ActionButton, css, FontWeights, TextField } from 'office-ui-fabric-react';
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

export const AddCallers: React.FC<ContentProps> = ({ projectId, callers, setCallers }) => {
  const handleRemove = (index) => {
    var currentCallers = callers.slice();
    currentCallers?.splice(index, 1);
    setCallers(currentCallers);
  };
  const handleAdd = () => {
    var currentCallers = callers.slice();
    currentCallers?.push('0000-11111-00000-11111');
    setCallers(currentCallers);
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
                value={caller}
                onChange={(e, newValue) => {
                  var currentCallers = callers.slice();
                  currentCallers[index] = newValue ?? '';
                  setCallers(currentCallers);
                }}
                borderless
              ></TextField>
            </div>
            <div css={tableRowItem('10%')}>
              <ActionButton styles={removeCaller} onClick={() => handleRemove(index)}>
                {formatMessage('Remove')}
              </ActionButton>
            </div>
          </div>
        );
      })}
      <ActionButton
        data-testid={'addNew'}
        styles={addNewAllowCallers}
        onClick={() => {
          handleAdd();
        }}
      >
        {formatMessage('Add allowd callers')}
      </ActionButton>
    </div>
  );
};
