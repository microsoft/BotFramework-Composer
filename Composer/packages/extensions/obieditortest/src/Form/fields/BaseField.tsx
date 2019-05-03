import React from 'react';
import { createTheme } from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import startCase from 'lodash.startcase';
import { JSONSchema6 } from 'json-schema';
import { IdSchema } from 'react-jsonschema-form';
import get from 'lodash.get';

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
  formContext: FormContext;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  schema: JSONSchema6;
  name?: string;
  idSchema: IdSchema;
  formData: T;
}

function RootDialog(props) {
  const { title, name, description, schema, formData } = props;

  const hasDesigner = !!get(schema, 'properties.$designer');

  const handleDesignerChange = newDesigner => {
    props.onChange({ ...formData, $designer: newDesigner });
  };

  return (
    <div>
      <h3>{title || schema.title || startCase(name)}</h3>
      {(description || schema.description) && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.medium].join(' ')}>
          {description || schema.description}
        </p>
      )}
      {hasDesigner && (
        <DesignerField data={get(formData, '$designer')} onChange={handleDesignerChange} parentData={formData} />
      )}
    </div>
  );
}

export function BaseField<T = any>(props: BaseFieldProps<T>): JSX.Element {
  const { children, title, name, description, schema, idSchema, formContext } = props;
  const isRoot = idSchema.__id === formContext.rootId;

  return (
    <div className="BaseField" key={idSchema.__id} id={idSchema.__id}>
      {isRoot ? (
        <RootDialog {...props} />
      ) : (
        <>
          <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
            {title || schema.title || startCase(name)}
          </Separator>
          {(description || schema.description) && (
            <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>
              {description || schema.description}
            </p>
          )}
        </>
      )}
      {children}
    </div>
  );
}

BaseField.defaultProps = {
  formContext: {},
};
