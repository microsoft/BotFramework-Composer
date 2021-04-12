// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { DialogInfo } from '@bfc/shared';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import formatMessage from 'format-message';

import { ContentProps } from '../constants';
import { dispatcherState, dialogsSelectorFamily } from '../../../../recoilModel';

import { SelectItems } from './SelectItems';

const textFieldStyles = (focused: boolean) => ({
  fieldGroup: {
    margin: '-5px 0',
    transition: 'border-color 0.1s linear',
    borderColor: 'transparent',
    backgroundColor: focused ? undefined : 'transparent',
    selectors: {
      ':hover': {
        borderColor: NeutralColors.gray30,
      },
    },
  },
});

interface DescriptionColumnProps extends DialogInfo {
  projectId: string;
}

const DescriptionColumn: React.FC<DescriptionColumnProps> = (props) => {
  const { id, displayName, projectId } = props;
  const items = useRecoilValue(dialogsSelectorFamily(projectId));
  const { content } = items.find(({ id: dialogId }) => dialogId === id) || {};

  const [value, setValue] = useState(content?.$designer?.description);
  const [focused, setFocused] = useState(false);
  const { updateDialog } = useRecoilValue(dispatcherState);

  const sync = useRef(
    debounce((updateDialog: any, description: string, content: any) => {
      updateDialog({
        id,
        content: {
          ...content,
          $designer: {
            ...content.$designer,
            description,
          },
        },
      });
    }, 400)
  ).current;

  useEffect(() => {
    if (value !== content?.$designer?.description) {
      sync(updateDialog, value ?? '', content);
    }
  }, [value, updateDialog]);

  const handleChange = (_, newValue?: string) => {
    if (typeof newValue === 'string') {
      setValue(newValue);
    }
  };

  return (
    <div data-is-focusable aria-label={formatMessage('Edit {displayName} dialog description', { displayName })}>
      <TextField
        styles={{
          ...textFieldStyles(focused),
          root: { width: '100%' },
        }}
        value={value || ''}
        onBlur={() => {
          setFocused(false);
        }}
        onChange={handleChange}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onFocus={() => {
          setFocused(true);
        }}
      />
    </div>
  );
};

export const SelectDialogs: React.FC<ContentProps> = ({ selectedDialogs, setSelectedDialogs, projectId }) => {
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const items = useMemo(() => dialogs.map(({ id, content, displayName }) => ({ id, content, displayName })), [
    projectId,
  ]);

  // for detail file list in open panel
  const tableColumns = useMemo(
    () => [
      {
        key: 'column1',
        name: formatMessage('Name'),
        fieldName: 'id',
        minWidth: 300,
        maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
        sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
        data: 'string',
        onRender: (item: DialogInfo) => {
          return <span aria-label={item.displayName}>{item.displayName}</span>;
        },
        isPadded: true,
      },
      {
        key: 'column2',
        name: formatMessage('Description'),
        fieldName: 'description',
        minWidth: 300,
        maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        isSortedDescending: false,
        data: 'string',
        onRender: (item: DialogInfo) => {
          return <DescriptionColumn {...item} projectId={projectId} />;
        },
        isPadded: true,
      },
    ],
    [projectId]
  );

  const selection = new Selection({
    getKey: (item) => item.id,
    onSelectionChanged: () => {
      const selectedItems = selection.getSelection();
      setSelectedDialogs(selectedItems);
    },
  });

  useEffect(() => {
    for (const item of selectedDialogs) {
      selection.setKeySelected(selection.getKey(item), true, false);
    }
  }, []);
  return <SelectItems items={items} selection={selection} tableColumns={tableColumns} />;
};
