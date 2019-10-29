/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useState } from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { getUiOptions } from '@bfcomposer/react-jsonschema-form/lib/utils';
import get from 'lodash.get';
import omit from 'lodash.omit';
import { ObjectFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';

import ObjectItem from './ObjectItem';
import NewPropertyModal from './NewPropertyModal';

import './styles.css';

function canExpand({ formData, schema, uiSchema }: ObjectFieldTemplateProps): boolean {
  if (!schema.additionalProperties) {
    return false;
  }
  const { expandable } = getUiOptions(uiSchema);
  if (expandable === false) {
    return expandable;
  }
  // if ui:options.expandable was not explicitly set to false, we can add
  // another property if we have not exceeded maxProperties yet
  if (schema.maxProperties !== undefined) {
    return Object.keys(formData).length < schema.maxProperties;
  }
  return true;
}

const ObjectFieldTemplate: React.FunctionComponent<ObjectFieldTemplateProps> = props => {
  const { uiSchema } = props;
  const [showModal, setShowModal] = useState(false);
  const [editableProperty, setEditableProperty] = useState('');

  const handlePropertyEdit = (newName: string, newValue: string): void => {
    props.onChange({
      ...omit(props.formData, editableProperty),
      [newName]: newValue || get(props.formData, newName || editableProperty, ''),
    });
    setShowModal(false);
    setEditableProperty('');
  };

  const onEditProperty = (propName: string): void => {
    setEditableProperty(propName);
    setShowModal(true);
  };

  const onDismiss = (): void => {
    setEditableProperty('');
    setShowModal(false);
  };

  const isHidden = (property: string) => {
    return uiSchema['ui:hidden'] && Array.isArray(uiSchema['ui:hidden']) && uiSchema['ui:hidden'].includes(property);
  };

  return (
    <div className="ObjectFieldTemplate" key={props.idSchema.__id}>
      <BaseField {...props}>
        {props.properties
          .filter(p => !isHidden(p.name))
          .map(p => (
            <ObjectItem {...p} key={p.name} onEdit={() => onEditProperty(p.name)} onAdd={() => setShowModal(true)} />
          ))}
        {canExpand(props) && (
          <>
            <DefaultButton type="button" onClick={() => setShowModal(true)} styles={{ root: { marginTop: '10px' } }}>
              {formatMessage('Add')}
            </DefaultButton>
            {showModal && (
              <NewPropertyModal
                onSubmit={handlePropertyEdit}
                onDismiss={onDismiss}
                name={editableProperty}
                schema={props.schema || {}}
              />
            )}
          </>
        )}
      </BaseField>
    </div>
  );
};

export default ObjectFieldTemplate;
