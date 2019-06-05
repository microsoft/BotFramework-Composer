/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef, useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { List, ScrollToMode } from 'office-ui-fabric-react/lib/List';
import formatMessage from 'format-message';
import { LGParser } from 'botbuilder-lg';

import { Store } from '../../store/index';
import { actionButton, formCell } from '../language-understanding/styles';

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
  const selectedTemplate = props.selectedTemplate;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const [templates, setTemplates] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (lodash.isEmpty(lgFile) === false && Array.isArray(lgFile.templates)) {
      setTemplates([...lgFile.templates]);
    }
  }, [lgFile]);

  useEffect(() => {
    if (selectedTemplate) {
      console.log(selectedTemplate);
      console.log(templates);
      listRef.current.scrollToIndex(
        7,
        idx => {
          console.log(idx);
          return 50;
        },
        ScrollToMode.top
      );
    }
  }, [selectedTemplate]);

  const getTemplatesMoreButtons = (item, index) => {
    return [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          const newItems = [...templates];
          newItems[index].editing = true;
          setTemplates(newItems);
        },
      },
      {
        key: 'delete',
        name: 'Delete',
        onClick: () => {
          onRemoveTemplate(index);
        },
      },
      {
        key: 'copy',
        name: 'Make a copy',
        onClick: () => {
          onCopyTemplate(index);
        },
      },
    ];
  };

  const tableColums = [
    {
      key: 'fileName',
      name: 'File',
      fieldName: 'fileName',
      minWidth: 50,
      maxWidth: 100,
      data: 'string',
      onRender: (template, index) => {
        return index === 0 ? <div css={formCell}>{`${template.fileId}.lg`}</div> : <div />;
      },
    },
    {
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      data: 'string',
      onRender: (item, index) => {
        return item.editing ? (
          <TextField
            borderless
            placeholder={formatMessage('Template Name.')}
            value={item.Name}
            validateOnLoad={false}
            onGetErrorMessage={newName => {
              return validateNameMessage(newName);
            }}
            onBlur={() => submitTemplateChange(index)}
            onChange={(event, newName) => updateTemplateContent(item, newName, item.Body)}
          />
        ) : (
          <div css={formCell}>{item.Name}</div>
        );
      },
    },
    {
      key: 'details',
      name: formatMessage('Details'),
      fieldName: 'details',
      minWidth: 500,
      isResizable: true,
      data: 'string',
      isPadded: true,
      onRender: getTemplateDetailCell,
    },
    {
      key: 'usedIn',
      name: formatMessage('Used in'),
      fieldName: 'usedIn',
      minWidth: 50,
      maxWidth: 100,
      data: 'string',
      onRender: () => {
        return <Link>PlaceHolder</Link>;
      },
    },
    {
      key: 'buttons',
      name: '',
      fieldName: 'buttons',
      data: 'string',
      onRender: (item, index) => {
        return (
          <CommandBar
            overflowItems={getTemplatesMoreButtons(item, index)}
            overflowButtonProps={{ ariaLabel: 'More commands' }}
            ariaLabel={'Use left and right arrow keys to navigate between commands'}
          />
        );
      },
    },
  ];

  const validateNameMessage = name => {
    if (name === '') {
      return formatMessage('name can not be empty');
    }

    if (templates.filter(item => item.Name === name).length > 1) {
      return formatMessage('name has been taken');
    }

    return lgParserValidate(name, '- body');
  };

  const validateBodyMessage = body => {
    return lgParserValidate('name', body);
  };

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <div data-testid="formHeader">
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
          <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
            {formatMessage('New template')}
          </ActionButton>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }

  function getTemplateDetailCell(item, index) {
    return item.editing ? (
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
        onBlur={() => submitTemplateChange(index)}
        onChange={(event, newBody) => updateTemplateContent(item, item.Name, newBody)}
      />
    ) : (
      <div css={formCell}>{item.Body}</div>
    );
  }

  // submit template change in component state
  function submitTemplateChange(templateIndex) {
    const templateInState = templates[templateIndex];
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
    const template = templates.find(item => currentTemplate.Name === item.Name);
    template.Name = newName;
    template.Body = newBody;
    template.changed = true;
  }

  function onCreateNewTemplate() {
    const newItems = [...templates];
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

  function onRemoveTemplate(index) {
    const newItems = [...templates];
    newItems.splice(index, 1);
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(newItems),
    };

    updateLgFile(payload);
  }

  function onCopyTemplate(index) {
    const newItems = [...templates];

    newItems.push({
      Name: `${newItems[index].Name}.Copy`,
      Body: newItems[index].Body,
    });
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(newItems),
    };

    updateLgFile(payload);
  }

  return (
    <Fragment>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          componentRef={listRef}
          items={templates}
          compact={false}
          columns={tableColums}
          getKey={item => item.Name}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          onRenderDetailsHeader={onRenderDetailsHeader}
          selectionMode={SelectionMode.none}
        />
      </ScrollablePane>
    </Fragment>
  );
}
