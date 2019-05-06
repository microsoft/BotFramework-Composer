/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef, useState } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { Store } from '../../../store/index';

import NewLgTemplateModal from './NewLgTemplateModal';
import { scrollablePaneRoot, title, label, actionButton } from './styles';

export function LanguageGenerationSettings() {
  const { state, actions } = useContext(Store);
  const { lgFiles } = state;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const [modalOpen, setModalOpen] = useState(false);
  // items used to render the detail table.
  const items = lgFiles.flatMap((file, fileIndex) => {
    const templates = file.templates.map((template, templateIndex) => {
      return {
        id: `${fileIndex}:${templateIndex}`,
        fileId: file.id,
        name: template.name,
        value: template.name,
        type: template.type,
        content: template.content,
        comments: template.comments,
      };
    });
    return templates;
  });

  // init groups for detail table.
  let startIndex = 0;
  const groups = lgFiles.map(file => {
    const group = {
      name: file.id + '.lg',
      count: file.templates.length,
      key: file.id,
      startIndex: startIndex,
    };
    startIndex += file.templates.length;
    return group;
  });

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
              onChange={(event, newName) => updateTemplateContent(item.id, item.fileId, newName, item.content)}
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
        onChange={(event, newValue) => updateTemplateContent(item.id, item.fileId, item.name, newValue)}
      />
    );
  }

  function updateTemplateContent(templateId, fileId, templateName, content) {
    const fileIndex = templateId.split(':')[0];
    const templateIndex = templateId.split(':')[1];
    const newTemplate = lgFiles[fileIndex].templates[templateIndex];
    const isValid = templateName && content;
    newTemplate.name = templateName;
    newTemplate.content = content;
    newTemplate.type = content.includes('- IF') || content.includes('- DEFAULT') ? 'Condition' : 'Rotate';

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
      content: '',
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
    await actions.addLgFile(data);
    setModalOpen(false);
  }

  return (
    <Fragment>
      <div>
        <div css={title}>{formatMessage('Content > Language Generation')}</div>
        <div css={label}>
          {formatMessage('Templates')}
          <IconButton
            style={{ marginLeft: '10px' }}
            iconProps={{ iconName: 'Add' }}
            title={formatMessage('New LG Template')}
            ariaLabel={formatMessage('New LG Template')}
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
            }}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
      <NewLgTemplateModal isOpen={modalOpen} onDismiss={() => setModalOpen(false)} onSubmit={onSubmit} />
    </Fragment>
  );
}
