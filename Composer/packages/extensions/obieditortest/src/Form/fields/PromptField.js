import React from 'react';
import { TextField } from 'office-ui-fabric-react';
import { get } from 'lodash';

export function PromptField(props) {
  const onChange = name => (e, val) => {
    props.onChange({ ...props.formData, [name]: val });
  };

  const schema = props.schema.properties;

  if (!schema) {
    return null;
  }

  return (
    <div className="PromptField">
      {Object.keys(schema)
        .filter(f => !f.startsWith('$'))
        .map(field => {
          const span = get(props, 'uiSchema.ui:options.span');

          const style = {
            gridColumnEnd: span ? `span ${span}` : null,
          };

          return (
            <div style={style}>
              <TextField
                key={field}
                value={props.formData[field]}
                onChange={onChange(field)}
                label={schema[field].title}
              />
            </div>
          );
        })}
    </div>
  );
}

export const prompt = PromptField;
