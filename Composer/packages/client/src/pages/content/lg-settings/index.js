/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import merge from 'lodash.merge';
import { Fragment, useContext, useRef, useState, useMemo } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { Store } from '../../../store/index';

import NewLgFileModal from './NewLgFileModal';
import { scrollablePaneRoot, title, label, actionButton } from './styles';

export function LanguageGenerationSettings() {
  const { state, actions } = useContext(Store);
  const { lgFiles } = state;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const [modalOpen, setModalOpen] = useState(false);

  // store in state, then merge it.
  // so we won't lose page status.
  // such as group collapsed, item editing, focus and so on.
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);

  // items used to render the detail table.
  useMemo(() => {
    const newItems = lgFiles.flatMap((file, fileIndex) => {
      const templates = file.templates.map((template, templateIndex) => {
        return {
          id: `${fileIndex}:${templateIndex}`,
          fileId: file.id,
          name: template.name,
          value: template.name,
          type: template.body.includes('- IF') ? 'Condition' : 'Rotate',
          body: template.body,
        };
      });
      return templates;
    });

    setItems(merge(items, newItems));
  }, [lgFiles]);

  // groups for detail table.
  useMemo(() => {
    let startIndex = 0;
    const newGroups = lgFiles.map(file => {
      const group = {
        name: file.id + '.lg',
        count: file.templates.length,
        key: file.id,
        startIndex: startIndex,
      };
      startIndex += file.templates.length;
      return group;
    });

    setGroups(merge(groups, newGroups));
  }, [lgFiles]);

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
              onChange={(event, newName) => updateTemplateContent(item.id, item.fileId, newName, item.body)}
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
        defaultValue={item.body}
        onChange={(event, newValue) => updateTemplateContent(item.id, item.fileId, item.name, newValue)}
      />
    );
  }

  function updateTemplateContent(templateId, fileId, templateName, body) {
    const fileIndex = templateId.split(':')[0];
    const templateIndex = templateId.split(':')[1];
    const newTemplate = lgFiles[fileIndex].templates[templateIndex];
    const isValid = templateName && body;
    newTemplate.name = templateName;
    newTemplate.body = body;

    const payload = {
      id: fileId,
      lgTemplates: lgFiles[fileIndex].templates,
      isValid: isValid,
    };

    updateLgFile(payload);
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

  function onCreateNewTempalte(selectedGroup) {
    const id = selectedGroup.key;
    const lgTemplates = lgFiles.find(file => file.id === id).templates;
    lgTemplates.push({
      name: '',
      value: '',
      type: 'Rotate',
      body: '',
      comments: '',
    });
    const payload = {
      id: id,
      lgTemplates: lgTemplates,
      isValid: false,
    };
    updateLgFile(payload);
  }

  function onRenderGroupFooter(groupProps) {
    return (
      <div>
        {' '}
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => onCreateNewTempalte(groupProps.group)}
        >
          New
        </ActionButton>{' '}
      </div>
    );
  }

  async function onSubmit(data) {
    await actions.createLgFile(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
      <div>
        <div css={title}>{formatMessage('Content > Language Generation')}</div>
        <div css={label}>
          {formatMessage('Files')}
          <IconButton
            style={{ marginLeft: '10px' }}
            iconProps={{ iconName: 'Add' }}
            title={formatMessage('New LG file')}
            ariaLabel={formatMessage('New LG file')}
            onClick={() => setModalOpen(true)}
          />
        </div>
        <ScrollablePane css={scrollablePaneRoot} scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
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
              showEmptyGroups: true,
              isAllGroupsCollapsed: true,
            }}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
      <NewLgFileModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onSubmit} />
    </Fragment>
  );
}
