import React from 'react';
import { createTheme } from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import startCase from 'lodash.startcase';
import { JSONSchema6 } from 'json-schema';
import { IdSchema } from '@bfdesigner/react-jsonschema-form';
import get from 'lodash.get';
import classnames from 'classnames';

import { FormContext } from '../types';

import './styles.scss';

import { DesignerField } from './DesignerField';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '18px',
    },
  },
  palette: {
    neutralLighter: NeutralColors.gray60,
  },
});

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
}

const overrideDefaults = {
  title: undefined,
  description: undefined,
};

function RootDialog(props) {
  const { title, name, description, schema, formData, formContext } = props;

  const templateOverrides = get(formContext.editorSchema, 'content.fieldTemplateOverrides.BaseField', overrideDefaults);

  const hasDesigner = !!get(schema, 'properties.$designer');

  const handleDesignerChange = newDesigner => {
    props.onChange({ ...formData, $designer: newDesigner });
  };

  return (
    <div id={props.id}>
      {templateOverrides.title === false ? null : (
        <h3 className={classnames('RootFieldTitle', FontClassNames.xxLarge)}>
          {title || schema.title || startCase(name)}
        </h3>
      )}
      {templateOverrides.description === false
        ? null
        : (description || schema.description) && (
            <p className={classnames('RootFieldDescription', ColorClassNames.neutralSecondary, FontClassNames.medium)}>
              {description || schema.description}
            </p>
          )}
      {hasDesigner && <DesignerField data={get(formData, '$designer')} onChange={handleDesignerChange} />}
      {props.children}
    </div>
  );
}

export function BaseField<T = any>(props: BaseFieldProps<T>): JSX.Element {
  const { children, title, name, description, schema, idSchema, formContext, className } = props;
  const isRoot = idSchema.__id === formContext.rootId;

  return isRoot ? (
    <RootDialog {...props} key={idSchema.__id} id={idSchema.__id} formContext={formContext}>
      {children}
    </RootDialog>
  ) : (
    <div className={classnames('BaseField', className)} key={idSchema.__id} id={idSchema.__id}>
      <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
        {title || schema.title || startCase(name)}
      </Separator>
      {(description || schema.description) && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>
          {description || schema.description}
        </p>
      )}
      {children}
    </div>
  );
}

BaseField.defaultProps = {
  formContext: {},
};
