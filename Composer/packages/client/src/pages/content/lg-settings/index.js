/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { Store } from '../../../store/index';

import { scrollablePaneRoot, title, label } from './styles';

export function LanguageGenerationSettings() {
  const { state, actions } = useContext(Store);
  const { lgTemplates } = state;
  const updateLG = useRef(debounce(actions.updateLgTemplate, 500)).current;
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
      onRender: (item, index) => {
        return (
          <span>
            <TextField
              borderless
              placeholder="Template Name."
              defaultValue={item.name}
              onChange={(event, newName) => updateTemplateContent(index, item.fileName, newName, item.content)}
            />
          </span>
        );
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
      onRender: (item, index) => {
        return <span>{getTemplatePhrase(item, index)}</span>;
      },
    },
  ];

  function updateTemplateContent(index, file, templateName, content) {
    const newTemplate = lgTemplates[index];
    newTemplate.name = templateName;
    newTemplate.content = content;

    const payload = {
      name: file,
      content: newTemplate,
    };

    updateLG(payload);
  }

  function getTemplatePhrase(item, index) {
    return (
      <TextField
        borderless
        multiline
        autoAdjustHeight
        placeholder="Template Content."
        defaultValue={item.content}
        onChange={(event, newValue) => updateTemplateContent(index, item.fileName, item.name, newValue)}
      />
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
  if (lgTemplates) {
    lgTemplates.forEach(template => {
      items.push({
        name: template.name,
        value: template.name,
        fileName: template.fileName,
        type: template.type,
        content: template.content,
        comments: template.comments,
      });
    });
  }

  const groups = [];
  let currentKey = '';
  let itemCount = 0;
  lgTemplates.forEach((template, index) => {
    if (template.fileName !== currentKey) {
      if (itemCount !== 0) {
        groups.push({
          name: currentKey + '.lg',
          count: itemCount,
          key: currentKey,
          startIndex: index - itemCount,
        });
        itemCount = 0;
      }
      currentKey = template.fileName;
    }
    itemCount++;
    if (index === lgTemplates.length - 1) {
      groups.push({ name: currentKey + '.lg', count: itemCount, key: currentKey, startIndex: index - itemCount + 1 });
    }
  });

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
            groups={groups}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}
