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
  mainWrapper: css({ display: 'flex' }),
  iconWrapper: css({
    ...sharedFieldIconStyles,
    textAlign: 'center',
    border: '1px solid rgb(96, 94, 92)',
    borderRadius: '2px 0 0 2px',
    borderRight: 'none',
    cursor: 'default',
  }),
  componentWrapper: css({ flexGrow: 1 }),
};
export function WithTypeIcons(WrappedComponent: FieldWidget): FieldWidget {
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
        <div css={styles.mainWrapper}>
          {iconText && <div css={styles.iconWrapper}>{iconText}</div>}
          <div css={styles.componentWrapper}>
            <WrappedComponent hasIcon {...props} label={undefined} />
          </div>
        </div>
      </React.Fragment>
    );
  };
}
