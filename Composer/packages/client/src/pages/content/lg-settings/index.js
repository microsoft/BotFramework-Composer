/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import lodash from 'lodash';
import { Fragment, useContext, useRef, useState, useEffect } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { LGParser } from 'botbuilder-lg';

import { Store } from '../../../store/index';

import NewLgFileModal from './NewLgFileModal';
import { scrollablePaneRoot, title, label, actionButton } from './styles';

const lgParserValidate = (name, body) => {
  const text = ['#', name, '\n', body].join('');
  const res = LGParser.TryParse(text);
  return res.isValid ? '' : res.error.Message;
};

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
  useEffect(() => {
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
    setItems(newItems);
  }, [lgFiles]);

  // groups for detail table.
  useEffect(() => {
    let startIndex = 0;
    const newGroups = lgFiles.map(file => {
      const group = {
        name: file.id + '.lg',
        count: file.templates.length,
        key: file.id,
        startIndex: startIndex,
      };
      startIndex += file.templates.length;
      return lodash.merge(lodash.find(groups, { key: file.id }), group);
    });

    setGroups(newGroups);
  }, [lgFiles]);

  const tableColums = [
    {
      key: 'name',
      name: formatMessage('Name'),
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
              value={item.name}
              validateOnLoad={false}
              onGetErrorMessage={newName => {
                return validateNameMessage(newName);
              }}
              onBlur={() => submitTemplateChange(item)}
              onChange={(event, newName) => updateTemplateContent(item, newName, item.body)}
            />
          </span>
        );
      },
    },
    {
      key: 'type',
      name: formatMessage('Type'),
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
      name: formatMessage('Sample phrase'),
      fieldName: 'samplePhrase',
      minWidth: 500,
      isResizable: true,
      data: 'string',
      isPadded: true,
      onRender: item => {
        return <span>{getTemplatePhrase(item)}</span>;
      },
    },
    {
      key: 'buttons',
      name: formatMessage('Delete template'),
      fieldName: 'buttons',
      minWidth: 50,
      maxWidth: 100,
      data: 'string',
      isPadded: true,
      onRender: item => {
        return (
          <ActionButton css={actionButton} iconProps={{ iconName: 'Delete' }} onClick={() => onRemoveTempalte(item)} />
        );
      },
    },
  ];

  const validateNameMessage = name => {
    if (name === '') {
      return formatMessage('name can not be empty');
    }

    if (items.filter(item => item.name === name).length > 1) {
      return formatMessage('name has been taken');
    }

    return lgParserValidate(name, '- body');
  };

  const validateBodyMessage = body => {
    return lgParserValidate('name', body);
  };

  function getTemplatePhrase(item) {
    return (
      <TextField
        borderless
        multiline
        autoAdjustHeight
        placeholder={formatMessage('Template Content.')}
        value={item.body}
        validateOnLoad={false}
        onGetErrorMessage={newBody => {
          return validateBodyMessage(newBody);
        }}
        onBlur={() => submitTemplateChange(item)}
        onChange={(event, newBody) => updateTemplateContent(item, item.name, newBody)}
      />
    );
  }

  // submit template change in component state
  function submitTemplateChange(currentTemplate) {
    const templateInState = items.find(item => currentTemplate.id === item.id);
    const { name, body, changed } = templateInState;
    const isValid = lgParserValidate(name, body);

    // if no change, reject
    // if is not valid, reject
    if (changed !== true || isValid !== '') return;
    const [fileIndex, itemIndex] = currentTemplate.id.split(':');
    const templateInLgFile = lgFiles[fileIndex].templates[itemIndex];

    templateInLgFile.name = name;
    templateInLgFile.body = body;
    const payload = {
      id: currentTemplate.fileId,
      lgTemplates: lgFiles[fileIndex].templates,
    };
    updateLgFile(payload);
  }

  // update template in component state
  function updateTemplateContent(currentTemplate, newName, newBody) {
    const newItems = [...items];
    const template = newItems.find(item => currentTemplate.id === item.id);
    template.name = newName;
    template.body = newBody;
    template.changed = true;
    setItems(newItems);
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
    };
    updateLgFile(payload);
  }

  function onRemoveTempalte(item) {
    const { fileId, name } = item;
    const lgTemplates = lgFiles.find(file => file.id === fileId).templates;
    const templateIndex = lgTemplates.findIndex(template => {
      return name === template.name;
    });

    lgTemplates.splice(templateIndex, 1);
    const payload = {
      id: fileId,
      lgTemplates: lgTemplates,
    };

    updateLgFile(payload);
  }

  function onRemoveLgFile(selectedGroup) {
    const title = formatMessage(`Confirm delete ${selectedGroup.name} file?`);

    if (confirm(title) === false) return;

    const id = selectedGroup.key;
    const payload = {
      id: id,
    };
    actions.removeLgFile(payload);
  }

  function onRenderGroupFooter(groupProps) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '1050px' }}>
        {' '}
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => onCreateNewTempalte(groupProps.group)}
        >
          {formatMessage('New template')}
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'Delete' }}
          onClick={() => onRemoveLgFile(groupProps.group)}
        >
          {formatMessage('Delete file')}
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
