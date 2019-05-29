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

const textFromTemplates = templates => {
  let text = '';
  templates.forEach(template => {
    if (template.Name && template.Body) {
      text += `# ${template.Name.trim()}` + '\n';
      text += `${template.Body.trim()}` + '\n\n';
    }
  });
  return text;
};

const randomName = () => {
  return `TemplateName${Math.floor(Math.random() * 1000)}`;
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
            value={item.Name}
            validateOnLoad={false}
            onGetErrorMessage={newName => {
              return validateNameMessage(newName);
            }}
            onBlur={() => submitTemplateChange(item)}
            onChange={(event, newName) => updateTemplateContent(item, newName, item.Body)}
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

    if (items.filter(item => item.Name === name).length > 1) {
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
        value={item.Body}
        validateOnLoad={false}
        onGetErrorMessage={newBody => {
          return validateBodyMessage(newBody);
        }}
        onBlur={() => submitTemplateChange(item)}
        onChange={(event, newBody) => updateTemplateContent(item, item.Name, newBody)}
      />
    );
  }

  // submit template change in component state
  function submitTemplateChange(currentTemplate) {
    const templateInState = items.find(item => currentTemplate.Name === item.Name);
    const templateIndex = items.findIndex(item => currentTemplate.Name === item.Name);
    const { Name, Body, changed } = templateInState;
    const isValid = lgParserValidate(Name, Body);

    // if no change, reject
    // if is not valid, reject
    if (changed !== true || isValid !== '') return;
    const templateInLgFile = lgFile.templates[templateIndex];

    templateInLgFile.Name = Name;
    templateInLgFile.Body = Body;
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(lgFile.templates),
    };
    updateLgFile(payload);
  }

  // update template in component state
  function updateTemplateContent(currentTemplate, newName, newBody) {
    const template = items.find(item => currentTemplate.Name === item.Name);
    template.Name = newName;
    template.Body = newBody;
    template.changed = true;
  }

  function onCreateNewTemplate() {
    const newItems = [...items];
    newItems.push({
      Name: randomName(), // need optimize
      Body: '-TemplateValue',
    });
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(newItems),
    };
    updateLgFile(payload);
  }

  function onRemoveTemplate(item) {
    const newItems = [...items];
    const templateIndex = items.findIndex(template => {
      return item.Name === template.Name;
    });

    newItems.splice(templateIndex, 1);
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(newItems),
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
          getKey={item => item.Name}
          // layoutMode={DetailsListLayoutMode.fixedColumns}
          // onRenderDetailsHeader={onRenderDetailsHeader}
          selectionMode={SelectionMode.none}
        />
      </div>
    </Fragment>
  );
}
