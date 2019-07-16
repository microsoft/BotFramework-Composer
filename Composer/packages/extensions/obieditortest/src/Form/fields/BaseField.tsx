import React from 'react';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';
import { JSONSchema6 } from 'json-schema';
import { IdSchema, UiSchema } from '@bfdesigner/react-jsonschema-form';
import get from 'lodash.get';
import classnames from 'classnames';

import { FormContext } from '../types';
import SectionSeparator from '../SectionSeparator';

import { DesignerField } from './DesignerField';

import './styles.scss';

const descriptionMarkup = description => {
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
  schema: JSONSchema6;
  title?: string;
  uiSchema: UiSchema;
}

const overrideDefaults = {
  title: undefined,
  description: undefined,
};

function RootDialog(props) {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext as FormContext;

  const overrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const hasDesigner = !!get(schema, 'properties.$designer');

  const handleDesignerChange = newDesigner => {
    props.onChange({ ...formData, $designer: newDesigner });
  };

  const getTitle = () => {
    const dialogName = isRoot && currentDialog.displayName;

    if (overrides.title === false) {
      return false;
    }

    return dialogName || overrides.title || title || schema.title || startCase(name);
  };

  const getDescription = () => {
    return overrides.description || description || schema.description;
  };

  return (
    <div id={props.id}>
      <SectionSeparator styles={{ marginTop: 0 }} label={getTitle()}>
        {overrides.description !== false && (description || schema.description) && (
          <p className={classnames('RootFieldDescription', ColorClassNames.neutralPrimaryAlt, FontClassNames.medium)}>
            {getDescription()}
          </p>
        )}
        {hasDesigner && <DesignerField data={get(formData, '$designer')} onChange={handleDesignerChange} />}
      </SectionSeparator>
      {props.children}
    </div>
  );
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

  return isRootBaseField ? (
    <RootDialog {...props} key={key} id={key}>
      {children}
    </RootDialog>
  ) : (
    <div className={classnames('BaseField', className)} key={key} id={key}>
      <SectionSeparator label={titleOverride || title || uiSchema['ui:title'] || schema.title || startCase(name)}>
        {descriptionOverride !== false && (descriptionOverride || description || schema.description) && (
          <p
            className={[ColorClassNames.neutralPrimaryAlt, FontClassNames.smallPlus].join(' ')}
            dangerouslySetInnerHTML={descriptionMarkup(
              descriptionOverride || description || uiSchema['ui:description'] || schema.description
            )}
          />
        )}
        {children}
      </SectionSeparator>
    </div>
  );
}

BaseField.defaultProps = {
  formContext: {},
  uiSchema: {},
};
