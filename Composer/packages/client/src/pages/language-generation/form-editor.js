/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef } from 'react';
import { DetailsList, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { LGParser } from 'botbuilder-lg';

import { Store } from '../../store/index';

import { actionButton } from './styles';

const lgParserValidate = (name, body) => {
  const text = ['#', name, '\n', body].join('');
  const res = LGParser.TryParse(text);
  return res.isValid ? '' : res.error.Message;
};

export default function FormEditor(props) {
  const { actions } = useContext(Store);
  const lgFile = props.file;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;

  const items = [...lgFile.templates];

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
        );
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
          <ActionButton css={actionButton} iconProps={{ iconName: 'Delete' }} onClick={() => onRemoveTemplate(item)} />
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
    const templateInState = items.find(item => currentTemplate.name === item.name);
    const templateIndex = items.findIndex(item => currentTemplate.name === item.name);
    const { name, body, changed } = templateInState;
    const isValid = lgParserValidate(name, body);

    // if no change, reject
    // if is not valid, reject
    if (changed !== true || isValid !== '') return;
    const templateInLgFile = lgFile.templates[templateIndex];

    templateInLgFile.name = name;
    templateInLgFile.body = body;
    const payload = {
      id: lgFile.id,
      lgTemplates: lgFile.templates,
    };
    updateLgFile(payload);
  }

  // update template in component state
  function updateTemplateContent(currentTemplate, newName, newBody) {
    const template = items.find(item => currentTemplate.name === item.name);
    template.name = newName;
    template.body = newBody;
    template.changed = true;
  }

  function onCreateNewTemplate() {
    const newItems = [...items];
    newItems.push({
      name: 'TemplateName',
      body: '-TemplateValue',
    });
    const payload = {
      id: lgFile.id,
      lgTemplates: newItems,
    };
    updateLgFile(payload);
  }

  function onRemoveTemplate(item) {
    const newItems = [...items];
    const templateIndex = items.findIndex(template => {
      return item.name === template.name;
    });

    newItems.splice(templateIndex, 1);
    const payload = {
      id: lgFile.id,
      lgTemplates: newItems,
    };

    updateLgFile(payload);
  }

  return (
    <Fragment>
      <div>
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
          {formatMessage('New template')}
        </ActionButton>
        <DetailsList
          items={lgFile.templates}
          compact={false}
          columns={tableColums}
          getKey={item => item.name}
          // layoutMode={DetailsListLayoutMode.fixedColumns}
          // onRenderDetailsHeader={onRenderDetailsHeader}
          selectionMode={SelectionMode.none}
        />
      </div>
    </Fragment>
  );
}
