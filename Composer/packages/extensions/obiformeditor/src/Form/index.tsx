import React from 'react';
import JSONForm, { UiSchema, Widget, FormProps as JSONFormProps } from '@bfcomposer/react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';

import * as widgets from './widgets';
import * as fields from './fields';
import ArrayFieldTemplate from './ArrayFieldTemplate';
import ObjectFieldTemplate from './ObjectFieldTemplate';
import FieldTemplate from './FieldTemplate';
import { FormContext } from './types';

import './styles.scss';

function removeUndefinedOrEmpty(object: any): any {
  if (object === null) {
    return null;
  }

  if (Array.isArray(object)) {
    return object.length > 0 ? object : undefined;
  }

  if (typeof object === 'object') {
    const obj = Object.assign({}, object); // Prevent mutation of source object.

    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
        continue;
      }

      const result = removeUndefinedOrEmpty(obj[key]);
      switch (typeof result) {
        case 'undefined':
          delete obj[key];
          break;
        case 'boolean':
          obj[key] = result;
          break;
        case 'object':
          if (Object.keys(result).length === 0) {
            delete obj[key];
          } else {
            obj[key] = result;
          }
          break;
        default:
          obj[key] = result;
      }
    }

    return obj;
  }

  return object;
}

interface FormProps extends JSONFormProps<object> {
  children: React.ReactChild;
  formContext: FormContext;
  formData: object;
  onBlur?: () => void;
  onChange?: (formData: object) => void;
  schema: JSONSchema6;
  uiSchema: UiSchema;
}

const Form: React.FunctionComponent<FormProps> = props => {
  const { formData, schema, uiSchema, onChange, formContext, ...rest } = props;

  return (
    <div className="FormContainer">
      <JSONForm
        ArrayFieldTemplate={ArrayFieldTemplate}
        fields={fields}
        FieldTemplate={FieldTemplate}
        formatData={removeUndefinedOrEmpty}
        formContext={formContext}
        formData={formData}
        ObjectFieldTemplate={ObjectFieldTemplate}
        onChange={onChange}
        safeRenderCompletion
        schema={schema}
        uiSchema={uiSchema}
        widgets={widgets as { [key: string]: Widget }}
        {...rest}
      />
    </div>
  );
};

Form.defaultProps = {
  onChange: () => {},
  onSubmit: () => {},
};

export default Form;
