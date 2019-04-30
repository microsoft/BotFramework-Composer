/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef, useState, useEffect } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { Store } from '../../../store/index';

import { scrollablePaneRoot, title, label, actionButton } from './styles';

export function LanguageGenerationSettings() {
  const { state, actions } = useContext(Store);
  const { lgTemplates } = state;
  const [initializedStatus, setInitializedStatus] = useState(false);
  const [items, setItems] = useState([]);
  const updateLG = useRef(debounce(actions.updateLgTemplate, 500)).current;

  function refreshItems(templates) {
    const newItems = [];
    templates.forEach(template => {
      newItems.push({
        id: template.id,
        name: template.name,
        value: template.name,
        absolutePath: template.absolutePath,
        type: template.type,
        content: template.content,
        comments: template.comments,
      });
    });
    setItems(newItems);
    setInitializedStatus(true);
  }

  useEffect(() => {
    if (initializedStatus === false && lgTemplates.length !== 0) {
      refreshItems(lgTemplates);
    }
  }, [lgTemplates]);

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
        return (
          <span>
            <TextField
              borderless
              placeholder={formatMessage('Template Name.')}
              defaultValue={item.name}
              onChange={(event, newName) => updateTemplateContent(item.id, newName, item.content)}
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
      onRender: item => {
        return <span>{getTemplatePhrase(item)}</span>;
      },
    },
  ];

  function getTemplatePhrase(item) {
    return (
      <TextField
        borderless
        multiline
        autoAdjustHeight
        placeholder={formatMessage('Template Content.')}
        defaultValue={item.content}
        onChange={(event, newValue) => updateTemplateContent(item.id, item.name, newValue)}
      />
    );
  }

  function updateTemplateContent(templateId, templateName, content) {
    const newTemplate = items.find(template => template.id === templateId);
    newTemplate.name = templateName;
    newTemplate.content = content;
    newTemplate.type = content.includes('- IF') || content.includes('- DEFAULT') ? 'Condition' : 'Rotate';

    const payload = {
      content: newTemplate,
    };

    updateLG(payload);
    refreshItems(items);
  }

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  function getNewItem(id) {
    return {
      id: id,
      name: '',
      value: '',
      absolutePath: '',
      type: 'Rotate',
      content: '',
      comments: '',
    };
  }

  function onCreateNewTempalte(groupIndex, selectedGroup) {
    const newItem = getNewItem(items.length + 1);
    groups.forEach((group, index) => {
      if (index === groupIndex) {
        const firstItem = items[selectedGroup.startIndex];
        newItem.absolutePath = firstItem.absolutePath;
        items.splice(selectedGroup.startIndex + selectedGroup.count, 0, newItem);
        selectedGroup.count++;
      }
      if (index > groupIndex) {
        group.startIndex++;
      }
    });
    refreshItems(items);
  }

  function onRenderGroupFooter(groupProps) {
    return (
      <div>
        {' '}
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => onCreateNewTempalte(groupProps.groupIndex, groupProps.group)}
        >
          New
        </ActionButton>{' '}
      </div>
    );
  }

  const groups = [];
  let currentKey = '';
  let itemCount = 0;
  items.forEach((item, index) => {
    if (item.absolutePath !== currentKey) {
      if (itemCount !== 0) {
        const pathItems = currentKey.split(/[\\/]+/g);
        groups.push({
          name: pathItems[pathItems.length - 1],
          count: itemCount,
          key: currentKey,
          startIndex: index - itemCount,
        });
        itemCount = 0;
      }
      currentKey = item.absolutePath;
    }
    itemCount++;
    if (index === items.length - 1) {
      const pathItems = currentKey.split(/[\\/]+/g);
      groups.push({
        name: pathItems[pathItems.length - 1],
        count: itemCount,
        key: currentKey,
        startIndex: index - itemCount + 1,
      });
    }
  });

  return (
    <Fragment>
      <div>
        <div css={title}>{formatMessage('Content > Language Generation')}</div>
        <div css={label}>{formatMessage('Templates')}</div>
        <ScrollablePane css={scrollablePaneRoot} scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            changed={initializedStatus}
            items={items}
            compact={false}
            columns={tableColums}
            getKey={item => item.id}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            onRenderDetailsHeader={onRenderDetailsHeader}
            selectionMode={SelectionMode.none}
            groups={groups}
            groupProps={{
              onRenderFooter: onRenderGroupFooter,
            }}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}
