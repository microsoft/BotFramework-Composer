import React from 'react';
import { createTheme } from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';
import { FieldProps } from 'react-jsonschema-form';

import { FormContext } from '../types';

import './styles.scss';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '24px',
    },
  },
  palette: {
    neutralLighter: '#d0d0d0',
  },
});

interface BaseFieldProps<T> extends FieldProps<T> {
  formContext: FormContext;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function BaseField<T = any>(props: BaseFieldProps<T>): JSX.Element {
  const { children, title, description } = props;

  return (
    <div className="BaseField">
      <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
        {title || props.schema.title || startCase(props.name)}
      </Separator>
      {(description || props.schema.description) && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>
          {description || props.schema.description}
        </p>
      )}
      {children}
    </div>
  );
}
