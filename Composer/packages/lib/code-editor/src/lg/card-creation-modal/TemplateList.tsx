// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  CheckboxVisibility,
  SelectionMode,
  Selection,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import formatMessage from 'format-message';

import { CardTemplate } from './types';

const Container = styled.div({
  paddingTop: '8px',
});

const tableColumns: IColumn[] = [
  {
    key: 'name',
    name: formatMessage('Name'),
    fieldName: 'name',
    minWidth: 150,
    maxWidth: 200,
    data: 'string',
    onRender: (item) => {
      return item.name ?? item.displayName;
    },
  },
];

type Props = {
  selectedTemplate: CardTemplate;
  templates: CardTemplate[];
  onTemplateSelected: (template: CardTemplate) => void;
};

export const TemplateList: React.FC<Props> = ({ selectedTemplate, templates, onTemplateSelected }) => {
  const selection = React.useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const template = selection.getSelection()[0] as CardTemplate;

        if (template) {
          onTemplateSelected(template);
        }
      },
    });
  }, [onTemplateSelected]);

  React.useEffect(() => {
    const index = templates.findIndex(({ displayName }) => displayName === selectedTemplate.displayName);
    selection.setIndexSelected(index, true, false);
  }, []);

  return (
    <Container>
      <ScrollablePane
        scrollbarVisibility={ScrollbarVisibility.auto}
        styles={{ root: { minHeight: '250px', position: 'relative', width: '300px' } }}
      >
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={tableColumns}
          compact={false}
          isHeaderVisible={false}
          items={templates}
          layoutMode={DetailsListLayoutMode.justified}
          selection={selection}
          selectionMode={SelectionMode.single}
        />
      </ScrollablePane>
    </Container>
  );
};
