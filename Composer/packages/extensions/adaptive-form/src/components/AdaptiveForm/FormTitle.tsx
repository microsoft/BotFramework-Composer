// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';
import startCase from 'lodash/startCase';
import formatMessage from 'format-message';
import { UIOptions, JSONSchema7 } from '@bfc/extension';

import { EditableField } from '../fields/EditableField';

import { title as styles } from './styles';

interface FormTitleProps {
  description?: string;
  formData: any;
  id: string;
  name?: string;
  onChange?: (data: any) => void;
  schema: JSONSchema7;
  title?: string;
  uiOptions?: UIOptions;
}

const FormTitle: React.FC<FormTitleProps> = props => {
  const { name, description, schema, formData, uiOptions = {} } = props;

  const handleTitleChange = (newTitle?: string): void => {
    if (props.onChange) {
      props.onChange({
        ...formData.$designer,
        name: newTitle,
      });
    }
  };

  const uiLabel = typeof uiOptions?.label === 'function' ? uiOptions.label(formData) : uiOptions.label;
  const uiSubtitle = typeof uiOptions?.subtitle === 'function' ? uiOptions.subtitle(formData) : uiOptions.subtitle;
  const getTitle = (): string => {
    const designerName = formData.$designer?.name;

    return designerName || uiLabel || schema.title || startCase(name);
  };

  const getHelpLinkLabel = (): string => {
    return (uiLabel || schema.title || startCase(name) || '').toLowerCase();
  };

  const getSubTitle = (): string => {
    return uiSubtitle || uiLabel || formData.$kind;
  };

  const getDescription = (): string => {
    const { description: descriptionOverride } = uiOptions;

    if (descriptionOverride) {
      if (typeof descriptionOverride === 'function') {
        const result = descriptionOverride(formData);

        if (result) {
          return result;
        }
      } else {
        return descriptionOverride;
      }
    }

    return description || schema.description || '';
  };

  return uiLabel !== false ? (
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
          ariaLabel={formatMessage('form title')}
        />
        <p css={styles.subtitle}>{getSubTitle()}</p>
        <p css={styles.description}>
          {getDescription()}
          {uiOptions?.helpLink && (
            <React.Fragment>
              <br />
              <br />
              <Link
                href={uiOptions?.helpLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={formatMessage('Learn more about {title}', { title: getHelpLinkLabel() })}
              >
                {formatMessage('Learn more')}
              </Link>
            </React.Fragment>
          )}
        </p>
      </div>
      {props.children}
    </div>
  ) : null;
};

export default FormTitle;
