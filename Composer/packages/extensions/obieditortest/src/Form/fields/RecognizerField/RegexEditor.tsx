import React from 'react';

export default function RegexEditor(props) {
  const {
    registry: {
      fields: { ObjectField },
    },
  } = props;
  const schema = props.schema.oneOf.find(s => s.title === 'Microsoft.RegexRecognizer');

  return <ObjectField {...props} schema={schema} />;
}
