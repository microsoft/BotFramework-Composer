import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';
import SectionSeparator from '../SectionSeparator';

import ArrayItem from './ArrayItem';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick } = props;

  return (
    <BaseField {...props}>
      <div className="ObjectArray">
        {items.map((element, idx) => (
          <ArrayItem {...element} key={idx} />
        ))}
        {canAdd && (
          <SectionSeparator
            collapsable={false}
            styles={{ marginTop: '20px' }}
            label={
              <PrimaryButton type="button" onClick={onAddClick} data-testid="ArrayContainerAdd">
                {formatMessage('Add')}
              </PrimaryButton>
            }
          />
        )}
      </div>
    </BaseField>
  );
};

ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default ObjectArray;
