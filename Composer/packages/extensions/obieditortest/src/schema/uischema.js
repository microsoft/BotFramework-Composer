const hideMetaData = {
  $ref: {
    'ui:widget': 'hidden',
  },
  $copy: {
    'ui:widget': 'hidden',
  },
  $id: {
    'ui:widget': 'hidden',
  },
  $type: {
    'ui:widget': 'hidden',
  },
};

export const uiSchema = {
  'Microsoft.TextPrompt': {
    ...hideMetaData,
    property: {
      'ui:options': {
        span: 2,
      },
    },
    pattern: {
      'ui:options': {
        span: 2,
      },
    },
  },
  'Microsoft.SendActivityTemplateStep': {
    ...hideMetaData,
  },
  'Microsoft.IntegerPrompt': {
    ...hideMetaData,
    minValue: {
      'ui:options': {
        span: 2,
      },
    },
    maxValue: {
      'ui:options': {
        span: 2,
      },
    },
  },
  'Microsoft.EndDialog': {
    ...hideMetaData,
  },
  'Microsoft.DateTimePrompt': {
    ...hideMetaData,
    minValue: {
      'ui:widget': 'datetime',
    },
    maxValue: {
      'ui:widget': 'datetime',
    },
  },
};
