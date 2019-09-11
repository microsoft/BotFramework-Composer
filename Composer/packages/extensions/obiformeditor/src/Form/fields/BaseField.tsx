import React from 'react';
import { ColorClassNames, FontClassNames, FontWeights } from '@uifabric/styling';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import startCase from 'lodash.startcase';
import { JSONSchema6 } from 'json-schema';
import { IdSchema, UiSchema } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash.get';
import classnames from 'classnames';

import { FormContext } from '../types';

import { RootField } from './RootField';

import './styles.scss';

const descriptionMarkup = (description: string): { __html: string } => {
  return { __html: description };
};

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
  const { children, title, name, description, schema, uiSchema, idSchema, formContext, className } = props;
  const isRootBaseField = idSchema.__id === formContext.rootId;
  const fieldOverrides = get(formContext.editorSchema, `content.SDKOverrides`);
  let titleOverride = undefined;
  let descriptionOverride = undefined;
  let key = idSchema.__id;

  if (schema.title) {
    const SDKOverrides = fieldOverrides[`${schema.title}`];
    titleOverride = get(SDKOverrides, 'title');
    descriptionOverride = get(SDKOverrides, 'description');
  }

  // use dialogId as the key because the focusPath may not be enough
  if (formContext.dialogId) {
    key = `${key}-${formContext.dialogId}`;
  }

  const getTitle = () => {
    if (titleOverride === false) {
      return null;
    }

    return titleOverride || title || uiSchema['ui:title'] || schema.title || startCase(name);
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
    <div
      className={classnames('BaseField', className)}
      key={key}
      id={key.replace(/\.|#/g, '')}
      style={{ borderBottom: `1px solid ${NeutralColors.gray60}` }}
    >
      <div>
        <h3 className="BaseFieldTitle">{getTitle()}</h3>
        {descriptionOverride !== false && (descriptionOverride || description || schema.description) && (
          <p className="BaseFieldDescription" dangerouslySetInnerHTML={descriptionMarkup(getDescription())} />
        )}
      </div>
      {children}
    </div>
  );
}

BaseField.defaultProps = {
  formContext: {},
  uiSchema: {},
};
