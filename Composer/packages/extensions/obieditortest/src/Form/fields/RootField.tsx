import { startCase, get } from 'lodash';
import React from 'react';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import classnames from 'classnames';
import { JSONSchema6 } from 'json-schema';

import SectionSeparator from '../SectionSeparator';
import { FormContext } from '../types';

import { DesignerField } from './DesignerField';

const overrideDefaults = {
  collapsable: true,
  defaultCollapsed: false,
  title: undefined,
  description: undefined,
};

interface RootFieldProps {
  description?: string;
  formContext: FormContext;
  formData: { $type: string };
  id: string;
  name?: string;
  onChange: (data: object) => void;
  schema: JSONSchema6;
  title?: string;
}

export const RootField: React.FC<RootFieldProps> = props => {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext;

  const fieldOverrides = get(editorSchema, 'content.fieldTemplateOverrides.RootField', overrideDefaults);
  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const hasDesigner = !!get(schema, 'properties.$designer');

  const handleDesignerChange = (newDesigner): void => {
    props.onChange({ ...formData, $designer: newDesigner });
  };

  const getTitle = (): false | string => {
    const dialogName = isRoot && currentDialog.displayName;

    if (sdkOverrides.title === false) {
      return false;
    }

    return dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };

  const getDescription = (): string => {
    return sdkOverrides.description || description || schema.description;
  };

  return (
    <div id={props.id} className="RootField">
      <SectionSeparator
        styles={{ marginTop: 0 }}
        label={getTitle()}
        collapsable={fieldOverrides.collapsable}
        defaultCollapsed={fieldOverrides.defaultCollapsed}
      >
        {sdkOverrides.description !== false && (description || schema.description) && (
          <p
            className={classnames('RootFieldDescription', ColorClassNames.neutralPrimaryAlt, FontClassNames.medium)}
            dangerouslySetInnerHTML={{ __html: getDescription() }}
          />
        )}
        {hasDesigner && (
          <DesignerField
            placeholder={currentDialog.displayName}
            data={get(formData, '$designer')}
            onChange={handleDesignerChange}
          />
        )}
      </SectionSeparator>
      {props.children}
    </div>
  );
};
