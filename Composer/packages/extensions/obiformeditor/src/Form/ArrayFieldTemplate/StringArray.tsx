import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';

import ArrayItem from './ArrayItem';

import './styles.scss';

const StringArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  return (
    <BaseField {...props}>
      {props.items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {props.canAdd && (
        <PrimaryButton type="button" onClick={e => props.onAddClick(e)} styles={{ root: { marginTop: '10px' } }}>
          {formatMessage('Add')}
        </PrimaryButton>
      )}
    </BaseField>
  );
};

StringArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default StringArray;
