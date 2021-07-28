// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useRef, useEffect } from 'react';
import { DialogInfo } from '@bfc/shared';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { ContentProps } from '../constants';
import { dialogsSelectorFamily } from '../../../../recoilModel';

import { SelectItems } from './SelectItems';

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
        name: formatMessage('Dialog name'),
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
    ],
    [projectId]
  );

  const selectionRef = useRef(
    new Selection({
      getKey: (item) => item.id,
      onSelectionChanged: () => {
        const selectedItems = selectionRef.current.getSelection();
        setSelectedDialogs(selectedItems);
      },
    })
  );

  useEffect(() => {
    for (const item of selectedDialogs) {
      selectionRef.current.setKeySelected(selectionRef.current.getKey(item), true, false);
    }
  }, []);
  return <SelectItems items={items} selection={selectionRef.current} tableColumns={tableColumns} />;
};
