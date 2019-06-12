/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import debounce from 'lodash.debounce';
import { useContext, useRef, useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollToMode } from 'office-ui-fabric-react/lib/List';
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

  console.log(props);

  useEffect(() => {
    if (lodash.isEmpty(lgFile) === false) {
      const parseResult = LGParser.TryParse(lgFile.content);

      if (parseResult.isValid) {
        const newTemplates = parseResult.templates.map((template, templateIndex) => {
          return {
            ...template,
            index: templateIndex,
          };
        });

        setTemplates(newTemplates);
      }
    }
  }, [lgFile]);

  useEffect(() => {
    if (selectedTemplate) {
      listRef.current.scrollToIndex(
        7,
        () => {
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
          const newItems = templates.map((t, idx) => {
            if (idx === index) {
              return { ...t, editing: true };
            }

            return t;
          });
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
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      data: 'string',
      onRender: (item, index) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }} css={formCell}>
            <div>#</div>
            {item.editing ? (
              <TextField
                borderless
                placeholder={formatMessage('Template Name.')}
                value={item.Name}
                validateOnLoad={false}
                onGetErrorMessage={newName => {
                  return validateNameMessage(newName);
                }}
                onBlur={() => submitTemplateChange(index)}
                onChange={(event, newName) => updateTemplateContent(index, newName, item.Body)}
              />
            ) : (
              <div>{item.Name}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'responses',
      name: formatMessage('Responses'),
      fieldName: 'responses',
      minWidth: 500,
      isResizable: true,
      data: 'string',
      isPadded: true,
      onRender: getTemplateDetailCell,
    },
    {
      key: 'usedIn',
      name: formatMessage('Used in:'),
      fieldName: 'usedIn',
      minWidth: 100,
      maxWidth: 200,
      data: 'string',
      onRender: () => {
        return <Link>PlaceHolder</Link>;
      },
    },
    {
      key: 'buttons',
      name: '',
      minWidth: 50,
      maxWidth: 50,
      fieldName: 'buttons',
      data: 'string',
      onRender: (item, index) => {
        return (
          <IconButton
            menuIconProps={{ iconName: 'More' }}
            menuProps={{
              shouldFocusOnMount: true,
              items: getTemplatesMoreButtons(item, index),
            }}
          />
        );
      },
    },
  ];

  const validateNameMessage = name => {
    if (name === '') {
      return formatMessage('name can not be empty');
    }

    if (templates.findIndex(item => item.Name === name).length > -1) {
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
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }
  function onRenderDetailsFooter() {
    return (
      <div data-testid="formFooter">
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
          {formatMessage('New template')}
        </ActionButton>
      </div>
    );
  }
  function getTemplateDetailCell(item, index) {
    return (
      <div css={formCell}>
        {item.editing ? (
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
            onChange={(event, newBody) => updateTemplateContent(index, item.Name, newBody)}
          />
        ) : (
          <div css={formCell}>{item.Body}</div>
        )}
      </div>
    );
  }

  // submit template change in component state
  function submitTemplateChange(templateIndex) {
    const templateInState = templates[templateIndex];
    const { Name, Body, changed } = templateInState;
    const isValid = lgParserValidate(Name, Body);
    const templateInLgFile = lgFile.templates[templateIndex];

    // if no change, set editing status to false
    if (changed !== true) {
      templateInLgFile.editing = false;
      setTemplates(lgFile.templates);
      return;
    }

    // if is not valid, reject
    if (isValid !== '') return;

    templateInLgFile.Name = Name;
    templateInLgFile.Body = Body;
    const payload = {
      id: lgFile.id,
      content: textFromTemplates(lgFile.templates),
    };
    updateLgFile(payload);
  }

  // update local templates
  function updateTemplateContent(index, newName, newBody) {
    const newTemplates = [...templates];
    newTemplates.splice(index, 1, { ...templates[index], Name: newName, Body: newBody, changed: true });
    setTemplates(newTemplates);
  }

  function onCreateNewTemplate() {
    const newItems = templates.concat({
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
    <div className={'form-list-editor'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          componentRef={listRef}
          items={templates}
          compact={false}
          columns={tableColums}
          getKey={item => item.Name}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderDetailsFooter={onRenderDetailsFooter}
          selectionMode={SelectionMode.none}
        />
      </ScrollablePane>
    </div>
  );
}
