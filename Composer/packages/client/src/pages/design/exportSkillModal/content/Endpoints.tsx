// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import { JSONSchema7, UIOptions } from '@bfc/extension';

import { ContentProps } from '../constants';

const styles = {
  container: css`
    height: 350px;
    overflow: auto;
  `,
};

export const Endpoints: React.FC<ContentProps> = ({ errors, value, schema, onChange }) => {
  const hidden = useMemo(() => Object.keys(schema?.properties as JSONSchema7).filter((key) => key !== 'endpoints'), []);

  const uiOptions: UIOptions = {
    hidden,
    label: false,
    properties: {
      endpoints: {
        hidden: ['protocol'],
        order: [['name', 'endpointUrl'], ['description', 'msAppId'], '*'],
      },
    },
  };

  return (
    <div css={styles.container}>
      <AdaptiveForm errors={errors} formData={value} schema={schema} uiOptions={uiOptions} onChange={onChange} />
    </div>
  );
};
