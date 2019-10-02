import { startCase, get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { FontClassNames, FontWeights } from '@uifabric/styling';
import classnames from 'classnames';
import { JSONSchema6 } from 'json-schema';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { TextField } from 'office-ui-fabric-react';
import formatMessage, { date } from 'format-message';

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
  const [hasBeenEdited, setHasBeenEdited] = useState<boolean>(false);

  useEffect(() => {
    if (!hasBeenEdited) {
      setTitle(props.title);
    }
  }, [props.title]);

  const handleChange = (_e: any, newValue?: string) => {
    setTitle(newValue);
    setHasBeenEdited(true);
    props.onChange(newValue);
  };

  const handleCommit = () => {
    setHasFocus(false);
    setEditing(false);
  };

  return (
    <div onMouseEnter={() => setEditing(true)} onMouseLeave={() => !hasFocus && setEditing(false)}>
      <TextField
        placeholder={props.title}
        value={title}
        styles={{
          root: { margin: '5px 0 7px -9px' },
          field: {
            fontSize: FontSizes.size20,
            fontWeight: FontWeights.semibold,
            selectors: {
              '::placeholder': {
                fontSize: FontSizes.size20,
              },
            },
          },
          fieldGroup: {
            borderColor: editing ? undefined : 'transparent',
            transition: 'border-color 0.1s linear',
            selectors: {
              ':hover': {
                borderColor: hasFocus ? undefined : NeutralColors.gray30,
              },
            },
          },
        }}
        onBlur={handleCommit}
        onFocus={() => setHasFocus(true)}
        onChange={handleChange}
        autoComplete="off"
      />
    </div>
  );
};

export const RootField: React.FC<RootFieldProps> = props => {
  const { title, name, description, schema, formData, formContext } = props;
  const { currentDialog, editorSchema, isRoot } = formContext;

  const sdkOverrides = get(editorSchema, ['content', 'SDKOverrides', formData.$type], overrideDefaults);

  const handleTitleChange = (newTitle?: string): void => {
    if (props.onChange) {
      props.onChange({ ...formData, $designer: { ...formData.$designer, name: newTitle } });
    }
  };

  const getTitle = (): string => {
    const dialogName = isRoot && currentDialog.displayName;

    return formData.$designer.name || dialogName || sdkOverrides.title || title || schema.title || startCase(name);
  };

  const getDescription = (): string => {
    return sdkOverrides.description || description || schema.description || '';
  };

  return (
    <div id={props.id} className="RootField">
      <div className="RootFieldTitle">
        <EditableTitle title={getTitle()} onChange={handleTitleChange} />
        {sdkOverrides.description !== false && (description || schema.description) && (
          <p
            className={classnames('RootFieldDescription', FontClassNames.smallPlus)}
            dangerouslySetInnerHTML={{ __html: getDescription() }}
          />
        )}
      </div>

      {props.children}

      <div className="RootFieldMetaData">
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
              ? date(Date.parse(get(formData, '$designer.updatedAt')), 'short')
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
