/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { Store } from '../../../store/index';

import { scrollablePaneRoot, title, label } from './styles';

export function LanguageGenerationSettings() {
  const { state } = useContext(Store);
  const { lgTemplates } = state;
  let currentFileContent = '';

  lgTemplates.forEach(lgTemplate => (currentFileContent += lgTemplate.content.toString()));
  // todo: use lg parser.
  const templates = [];
  const templateStrings = currentFileContent.split('#').filter(line => line);

  templateStrings.forEach(temp => {
    const lines = temp.match(/^.+$/gm);
    const newTemplate = {
      type: 'Rotate',
      content: '',
    };
    lines.forEach((innerLine, index) => {
      if (!innerLine.trim()) return;
      if (innerLine.trim().startsWith('>')) return;

      if (index === 0) {
        newTemplate.name = innerLine;
        return;
      }

      if (innerLine.trim().startsWith('- DEFAULT') || innerLine.trim().startsWith('- IF')) {
        newTemplate.type = 'Condition';
      }
      newTemplate.content += innerLine + '\r\n';
    });
    if (newTemplate.name) {
      templates.push(newTemplate);
    }
  });
  function getTemplatePhrase(content) {
    return (
      <TextField borderless multiline autoAdjustHeight placeholder="No borders here, folks." defaultValue={content} />
    );
  }

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
          // eslint-disable-next-line react/display-name
          onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  const items = [];
  if (templates) {
    templates.forEach(template => {
      items.push({
        name: template.name,
        value: template.name,
        type: template.type,
        content: template.content,
      });
    });
  }

  const tableColums = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: item => {
        return <span>{item.name}</span>;
      },
    },
    {
      key: 'type',
      name: 'Type',
      fieldName: 'type',
      minWidth: 50,
      maxWidth: 100,
      data: 'string',
      isPadded: true,
      onRender: item => {
        return <span>{item.type}</span>;
      },
    },
    {
      key: 'phrase',
      name: 'Sample phrase',
      fieldName: 'samplePhrase',
      minWidth: 500,
      isResizable: true,
      data: 'string',
      isPadded: true,
      onRender: item => {
        return <span>{getTemplatePhrase(item.content)}</span>;
      },
    },
  ];

  return (
    <Fragment>
      <div>
        <div css={title}>Content &gt; Language Generation</div>
        <div css={label}>Templates</div>
        <ScrollablePane css={scrollablePaneRoot} scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={items}
            compact={false}
            columns={tableColums}
            setKey="key"
            layoutMode={DetailsListLayoutMode.fixedColumns}
            onRenderDetailsHeader={onRenderDetailsHeader}
            selectionMode={SelectionMode.none}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}
