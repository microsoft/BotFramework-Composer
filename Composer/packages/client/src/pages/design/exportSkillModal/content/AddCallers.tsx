// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { ITextField, ITextFieldProps, TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useEffect, useRef, useState } from 'react';

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

interface BorderlessTextFieldProps extends Omit<ITextFieldProps, 'onChange' | 'onFocus' | 'onBlur'> {
  componentFocusOnMount?: boolean;
  onBlur?: () => void;
  onChange: (e, newValue?: string) => void;
  onFocus?: () => void;
}
const BorderlessTextField: React.FC<BorderlessTextFieldProps> = (props) => {
  const { componentFocusOnMount, borderless, value, onBlur, onChange, onFocus } = props;
  const fieldRef = useRef<ITextField>(null);
  useEffect(() => {
    if (componentFocusOnMount) {
      fieldRef.current?.focus();
    }
  }, [componentFocusOnMount]);
  return (
    <TextField
      borderless={borderless}
      componentRef={fieldRef}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
    />
  );
};
export const AddCallers: React.FC<ContentProps> = ({ projectId, callers, onUpdateCallers }) => {
  const handleRemove = (index) => {
    onUpdateCallers(callers.filter((_, i) => i !== index));
    setFocusCallerIndex(undefined);
  };
  const handleAddNewAllowedCallerClick = () => {
    const currentCallers = callers.slice();
    const index = currentCallers.findIndex((content) => content === '');
    if (index < 0) {
      currentCallers?.push('');
      onUpdateCallers(currentCallers);
      setFocusCallerIndex(currentCallers.length - 1);
    } else {
      // just focus on the first empty caller.
      setFocusCallerIndex(index);
    }
  };

  const [focusCallerIndex, setFocusCallerIndex] = useState<number | undefined>(0);

  return (
    <div>
      <div css={header}>
        <div css={tableColumnHeader()}>{formatMessage('Available as skill to the following bots:')}</div>
      </div>
      {callers?.map((caller, index) => {
        const isFocus = focusCallerIndex === index;
        return (
          <div key={index} css={tableRow}>
            <div css={tableRowItem('90%')} title={caller}>
              <BorderlessTextField
                borderless={!isFocus}
                componentFocusOnMount={isFocus}
                value={caller}
                onBlur={() => {
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
