// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { Fragment, useMemo } from 'react';

import { targetListItemSelected, targetListItemNotSelected } from './styles';
const allItems = { name: 'All Profiles', type: 'all', configuration: '', id: 'all' };
const noItem = { name: 'No Publish Profiles', type: 'no', configuration: '', id: 'no' };
export const TargetList = props => {
  const targets = useMemo(() => {
    if (props.list?.length > 0) {
      return [allItems, ...props.list];
    } else {
      return [allItems, noItem];
    }
  }, [props.list]);

  return (
    <Fragment>
      {targets.map((target, index) => {
        return (
          <DefaultButton
            key={index}
            onClick={() => props.onSelect(target)}
            styles={
              props.selectedTarget && props.selectedTarget.name === target.name
                ? targetListItemSelected
                : targetListItemNotSelected
            }
            text={target.name}
            ariaLabel={formatMessage('Publish Target')}
            ariaHidden={false}
          />
        );
      })}
    </Fragment>
  );
};
