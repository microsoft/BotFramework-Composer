// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { JSONSchema4 } from 'json-schema';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';
import startCase from 'lodash/startCase';

import { EditableField } from '../fields/EditableField';

import { title as styles } from './styles';

// const overrideDefaults = {
//   title: undefined,
//   description: undefined,
//   helpLink: undefined,
//   helpLinkText: undefined,
// };

interface FormTitleProps {
  description?: string;
  formData: any;
  id: string;
  name?: string;
  onChange?: (data: any) => void;
  schema: JSONSchema4;
  title?: string;
}

const FormTitle: React.FC<FormTitleProps> = props => {
  const { title, name, description, schema, formData } = props;

  const handleTitleChange = (e: any, newTitle?: string): void => {
    if (props.onChange) {
      props.onChange({
        ...formData.$designer,
        name: newTitle,
      });
    }
  };

  const getTitle = (): string => {
    const designerName = formData.$designer?.name;

    return designerName || title || schema.title || startCase(name);
  };

  const getSubTitle = (): string => {
    return formData.$type;
  };

  const getDescription = (): string => {
    return description || schema.description || '';
  };

  return (
    <div css={styles.container} id={props.id}>
      <div>
        <EditableField
          depth={0}
          fontSize={FontSizes.size20}
          id="form-title"
          name="$designer.name"
          schema={{}}
          styles={{
            field: { fontWeight: FontWeights.semibold },
            root: { margin: '5px 0 7px -9px' },
          }}
          uiOptions={{}}
          value={getTitle()}
          onChange={handleTitleChange}
        />
        <p css={styles.subtitle}>{getSubTitle()}</p>
        <p css={styles.description}>
          {getDescription()}
          {/* {sdkOverrides.helpLink && sdkOverrides.helpLinkText && (
            <>
              <br />
              <br />
              <a
                href={sdkOverrides.helpLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sdkOverrides.helpLinkText}
              </a>
            </>
          )} */}
        </p>
      </div>

      {props.children}
    </div>
  );
};

export default FormTitle;
