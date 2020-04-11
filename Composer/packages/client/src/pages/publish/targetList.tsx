// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Fragment } from 'react';

import { targetListItemSelected, targetListItemNotSelected } from './styles';

export const TargetList = props => {
  return (
    <Fragment>
      {props.list.map((target, index) => {
        return (
          <DefaultButton
            key={index}
            onClick={() => props.onSelect(target)}
            styles={props.selectedTarget === target.name ? targetListItemSelected : targetListItemNotSelected}
            text={target.name}
            ariaLabel={formatMessage('Publish Target')}
            ariaHidden={false}
          />
        );
      })}
    </Fragment>
  );
};
