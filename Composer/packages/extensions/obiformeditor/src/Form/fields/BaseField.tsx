// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import startCase from 'lodash/startCase';
import { JSONSchema6 } from 'json-schema';
import { IdSchema, UiSchema } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash/get';
import classnames from 'classnames';

import { FormContext } from '../types';
import { WidgetLabel } from '../widgets/WidgetLabel';

import { RootField } from './RootField';

import './styles.css';

interface BaseFieldProps<T> {
  children?: React.ReactNode;
  className?: string;
  description?: string;
  formContext: FormContext;
  formData: T;
  idSchema: IdSchema;
  name?: string;
  onChange?: (data: T) => void;
  schema: JSONSchema6;
  title?: string;
  uiSchema: UiSchema;
}

export function BaseField<T = any>(props: BaseFieldProps<T>): JSX.Element {
  const { children, className, description, formContext, idSchema, name, schema, title, uiSchema } = props;
  const isRootBaseField = idSchema.__id === formContext.rootId;
  const fieldOverrides = get(formContext.editorSchema, `content.SDKOverrides`);
  const { inline: displayInline, hideDescription } = (uiSchema['ui:options'] || {}) as any;
  let titleOverride;
  let descriptionOverride;
  let helpLink;
  let helpLinkText;
  let helpLinkLabel;
  let key = idSchema.__id;

  if (schema.title) {
    const SDKOverrides = fieldOverrides[`${schema.title}`];
    titleOverride = get(SDKOverrides, 'title');
    descriptionOverride = get(SDKOverrides, 'description');
    helpLink = get(SDKOverrides, 'helpLink');
    helpLinkText = get(SDKOverrides, 'helpLinkText');
    helpLinkLabel = get(SDKOverrides, 'helpLinkLabel');
  }

  // use dialogId as the key because the focusPath may not be enough
  if (formContext.dialogId) {
    key = `${key}-${formContext.dialogId}`;
  }

  const getTitle = () => {
    if (titleOverride === false) {
      return null;
    }

    return uiSchema['ui:title'] || titleOverride || title || schema.title || startCase(name);
  };

  const getDescription = () => {
    if (descriptionOverride === false) {
      return null;
    }

    return descriptionOverride || description || uiSchema['ui:description'] || schema.description;
  };

  return isRootBaseField ? (
    <RootField {...props} key={key} id={key.replace(/\.|#/g, '')}>
      {children}
    </RootField>
  ) : (
    <div className={classnames({ BaseField: !displayInline }, className)} key={key} id={key.replace(/\.|#/g, '')}>
      {!hideDescription && (
        <WidgetLabel
          label={getTitle()}
          description={getDescription()}
          helpLink={helpLink}
          helpLinkText={helpLinkText}
          helpLinkLabel={helpLinkLabel}
          id={key}
        />
      )}
      <div className={classnames({ BaseFieldInline: displayInline })}>{children}</div>
    </div>
  );
}

BaseField.defaultProps = {
  formContext: {},
  uiSchema: {},
};
