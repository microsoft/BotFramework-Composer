// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { FieldProps } from '@bfc/extension-client';
import { IPivotStyles, Pivot, PivotItem, PivotLinkSize } from 'office-ui-fabric-react/lib/components/Pivot';
import camelCase from 'lodash/camelCase';

import { getFieldsets } from '../../utils';

import { ObjectField } from './ObjectField';

const styles: { tabs: Partial<IPivotStyles> } = {
  tabs: {
    root: {
      display: 'flex',
    },
    link: {
      flex: 1,
    },
    linkIsSelected: {
      flex: 1,
    },
  },
};

export const PivotFieldsets: React.FC<FieldProps<object>> = (props) => {
  const { schema, uiOptions: baseUiOptions, value } = props;
  const [focusedTab, setFocusedTab] = useState<string | undefined>();
  const fieldsets = getFieldsets(schema, baseUiOptions, value);

  const handleTabChange = (item?: PivotItem) => {
    if (item) {
      setFocusedTab(item.props.itemKey);
      // shellApi.onFocusSteps(focusedSteps, item.props.itemKey);
    }
  };

  return (
    <div>
      <Pivot linkSize={PivotLinkSize.large} selectedKey={focusedTab} styles={styles.tabs} onLinkClick={handleTabChange}>
        {fieldsets.map(({ schema, uiOptions, title }, key) => (
          <PivotItem headerText={title} itemKey={camelCase(title)}>
            <ObjectField {...props} schema={schema} uiOptions={uiOptions} />
          </PivotItem>
        ))}
      </Pivot>
    </div>
  );

  return <React.Fragment></React.Fragment>;
};
