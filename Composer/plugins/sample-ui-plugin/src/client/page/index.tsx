// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { render, useProjectApi } from '@bfc/extension-client';
import {
  DetailsList,
  ScrollablePane,
  ScrollbarVisibility,
  CheckboxVisibility,
  DetailsListLayoutMode,
  IColumn,
  TextField,
} from '@fluentui/react';

const Main: React.FC = () => {
  const { dialogs, lgFiles, luFiles, qnaFiles, saveDialog } = useProjectApi();

  const items = useMemo(() => {
    const all: any[] = [];

    dialogs.forEach((d) => {
      all.push({
        name: d.id,
        type: 'dialog',
        content: d.content,
      });
    });

    luFiles.forEach((d) => {
      all.push({
        name: d.id,
        type: 'lu',
        content: d.content,
      });
    });

    lgFiles.forEach((d) => {
      all.push({
        name: d.id,
        type: 'lg',
        content: d.content,
      });
    });

    qnaFiles.forEach((d) => {
      all.push({
        name: d.id,
        type: 'qna',
        content: d.content,
      });
    });

    return all;
  }, [dialogs, luFiles, lgFiles, qnaFiles]);

  const handleFileChange = (type: string, fileId: string, data?: string) => {
    try {
      switch (type) {
        case 'dialog':
          return saveDialog(fileId, JSON.parse(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tableColumns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      data: 'string',
    },
    {
      key: 'type',
      name: 'Type',
      fieldName: 'type',
      minWidth: 200,
      maxWidth: 450,
      isResizable: true,
      data: 'string',
    },
    {
      key: 'content',
      name: 'Content',
      minWidth: 200,
      maxWidth: 800,
      isResizable: true,
      onRender: (item) => {
        if (item) {
          const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2);

          return (
            <TextField
              multiline
              defaultValue={content}
              onChange={(e, newVal) => handleFileChange(item.type, item.name, newVal)}
            />
          );
        }
      },
    },
  ];

  return (
    <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
      <DetailsList
        isHeaderVisible
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={tableColumns}
        layoutMode={DetailsListLayoutMode.justified}
        items={items}
      />
      Dialog data from project api
      <pre>{JSON.stringify(dialogs[0].content, null, 2)}</pre>
    </ScrollablePane>
  );
};

render(<Main />);
