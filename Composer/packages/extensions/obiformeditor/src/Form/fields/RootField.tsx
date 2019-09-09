import { startCase, get } from 'lodash';
import React, { useState } from 'react';
import { FontClassNames, FontSizes, FontWeights } from '@uifabric/styling';
import classnames from 'classnames';
import { JSONSchema6 } from 'json-schema';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { FormContext } from '../types';

const overrideDefaults = {
  collapsable: true,
  defaultCollapsed: false,
  title: undefined,
  description: undefined,
};

interface RootFieldProps {
  description?: string;
  formContext: FormContext;
  formData: any;
  id: string;
  name?: string;
  onChange?: (data: any) => void;
  schema: JSONSchema6;
  title?: string;
}

interface EditableTitleProps {
  title: string;
  onChange: (newTitle?: string) => void;
}

const EditableTitle: React.FC<EditableTitleProps> = props => {
  const [editing, setEditing] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>(props.title);

  const handleChange = (_e: any, newValue?: string) => {
    setTitle(newValue);
    props.onChange(newValue);
  };

  const handleCommit = () => {
    setHasFocus(false);
    setEditing(false);
  };

  return (
    <div onMouseEnter={() => setEditing(true)} onMouseLeave={() => !hasFocus && setEditing(false)}>
      {editing ? (
        <form onSubmit={handleCommit}>
          <TextField
            placeholder={props.title}
            value={title}
            styles={{
              root: { margin: '5px 0 7px -9px' },
              field: { fontSize: FontSizes.large, fontWeight: FontWeights.semibold },
            }}
            onBlur={handleCommit}
            onFocus={() => setHasFocus(true)}
            onChange={handleChange}
          />
          <button type="submit" hidden />
        </form>
      ) : (
        <h2 style={{ fontSize: FontSizes.large, fontWeight: FontWeights.semibold as number, margin: '10px 0' }}>
          {title || props.title}
        </h2>
      )}
    </div>
  );
};

export const RootField: React.FC<RootFieldProps> = props => {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext;

  // const fieldOverrides = get(editorSchema, 'content.fieldTemplateOverrides.RootField', overrideDefaults);
  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const handleTitleChange = (newTitle?: string): void => {
    if (props.onChange) {
      props.onChange({ ...formData, $designer: { ...formData.$designer, name: newTitle } });
    }
  };

  const getTitle = (): string => {
    const dialogName = isRoot && currentDialog.displayName;

    return dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };

  const getDescription = (): string => {
    return sdkOverrides.description || description || schema.description || '';
  };

  return (
    <div id={props.id} className="RootField">
      <div style={{ borderBottom: `1px solid ${NeutralColors.gray60}`, padding: '0 18px' }}>
        <EditableTitle title={getTitle()} onChange={handleTitleChange} />
        {sdkOverrides.description !== false && (description || schema.description) && (
          <p
            className={classnames('RootFieldDescription', FontClassNames.small)}
            dangerouslySetInnerHTML={{ __html: getDescription() }}
          />
        )}
      </div>

      {props.children}

      <div style={{ padding: '18px', display: 'flex' }}>
        <div style={{ marginRight: '36px' }}>
          <span style={{ marginRight: '8px', fontWeight: FontWeights.semibold as number }}>
            {formatMessage('ID number')}
          </span>
          <span style={{ minWidth: '75px', display: 'inline-block' }}>{get(formData, '$designer.id')}</span>
        </div>
        <div>
          <span style={{ marginRight: '8px', fontWeight: FontWeights.semibold as number }}>
            {formatMessage('Last Edited')}
          </span>
          <span>
            {get(formData, '$designer.updatedAt')
              ? formatMessage('{ updatedAt, date, short } { updatedAt, time }', {
                  updatedAt: Date.parse(get(formData, '$designer.updatedAt')),
                })
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
