import { startCase, get } from 'lodash';
import React from 'react';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import classnames from 'classnames';

import SectionSeparator from '../SectionSeparator';
import { FormContext } from '../types';

import { DesignerField } from './DesignerField';

const descriptionMarkup = description => {
  return { __html: description };
};

const overrideDefaults = {
  collapsable: true,
  defaultCollapsed: false,
  title: undefined,
  description: undefined,
};

export function RootField(props) {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext as FormContext;

  const fieldOverrides = get(editorSchema, 'content.fieldTemplateOverrides.RootField', overrideDefaults);
  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const hasDesigner = !!get(schema, 'properties.$designer');

  const handleDesignerChange = newDesigner => {
    props.onChange({ ...formData, $designer: newDesigner });
  };

  const getTitle = () => {
    const dialogName = isRoot && currentDialog.displayName;

    if (sdkOverrides.title === false) {
      return false;
    }

    return dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };

  const getDescription = () => {
    return sdkOverrides.description || description || schema.description;
  };

  return (
    <div id={props.id}>
      <SectionSeparator
        styles={{ marginTop: 0 }}
        label={getTitle()}
        collapsable={fieldOverrides.collapsable}
        defaultCollapsed={fieldOverrides.defaultCollapsed}
      >
        {sdkOverrides.description !== false && (description || schema.description) && (
          <p
            className={classnames('RootFieldDescription', ColorClassNames.neutralPrimaryAlt, FontClassNames.medium)}
            dangerouslySetInnerHTML={descriptionMarkup(getDescription())}
          />
        )}
        {hasDesigner && <DesignerField data={get(formData, '$designer')} onChange={handleDesignerChange} />}
      </SectionSeparator>
      {props.children}
    </div>
  );
}
