// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FieldProps, FieldWidget } from '@bfc/extension-client';
import React from 'react';
import { css } from '@emotion/core';

import { getFieldIconText } from '../utils/getFieldIconText';

import { FieldLabel } from './FieldLabel';
import { sharedFieldIconStyles } from './sharedStyles';

const styles = {
  wrapper: css({
    ...sharedFieldIconStyles,
    textAlign: 'center',
    border: '1px solid rgb(96, 94, 92)',
    borderRadius: '2px',
    cursor: 'default',
  }),
};
export function withTypeIcons(WrappedComponent: FieldWidget): FieldWidget {
  return (props: FieldProps) => {
    const iconText = getFieldIconText(props.schema.type);
    return (
      <React.Fragment>
        <FieldLabel
          description={props.description}
          helpLink={props.uiOptions?.helpLink}
          id={props.id}
          label={props.label}
          required={props.required}
        />
        <div style={{ display: 'flex' }}>
          <div css={styles.wrapper}>{iconText}</div>
          <div style={{ flexGrow: 1 }}>
            <WrappedComponent {...props} label={undefined} />
          </div>
        </div>
      </React.Fragment>
    );
  };
}
