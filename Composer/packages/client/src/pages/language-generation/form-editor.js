/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import debounce from 'lodash.debounce';
import { useContext, useRef, useEffect, useState } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { LGParser } from 'botbuilder-lg';

import { Store } from '../../store/index';
import { actionButton, formCell } from '../language-understanding/styles';

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
  const { state, actions } = useContext(Store);
  const { dialogs } = state;
  const lgFile = props.file;
  const activeDialog = props.activeDialog;
  const updateLgFile = useRef(debounce(actions.updateLgFile, 500)).current;
  const [templates, setTemplates] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (lodash.isEmpty(lgFile) === false) {
      const parseResult = LGParser.TryParse(lgFile.content);

      if (parseResult.isValid) {
        const allTemplates = parseResult.templates.map((template, templateIndex) => {
          return {
            ...template,
            index: templateIndex,
          };
        });

        if (!activeDialog) {
          setTemplates(allTemplates);
        } else {
          const dialogsReferenceThisTemplate = activeDialog.lgTemplates.reduce((result, item) => {
            const template = allTemplates.find(t => t.Name === item);
            if (!template) {
              new Error(`lg template ${item} not found`);
            } else {
              result.push(template);
            }
            return result;
          }, []);
          setTemplates(dialogsReferenceThisTemplate);
        }
      }
    }
  }, [lgFile, activeDialog]);

  const getTemplatesMoreButtons = (item, index) => {
    const buttons = [
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

    // do not allow delete/copy template in particular dialog
    if (activeDialog) {
      buttons.splice(1, 2);
    }

    return buttons;
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'name',
        name: formatMessage('Name'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        data: 'string',
        onRender: item => {
          return <div css={formCell}>#{item.Name}</div>;
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
        onRender: item => {
          return <div css={formCell}>{item.Body}</div>;
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

    // all view, show used in column
    if (!activeDialog) {
      const templateUsedInDialogMap = {};

      // build usedIn map
      templates.forEach(template => {
        templateUsedInDialogMap[template.Name] = dialogs.reduce((result, dialog) => {
          if (dialog.lgTemplates.indexOf(template.Name) !== -1) {
            result.push(dialog.name);
          }
          return result;
        }, []);
      });

      const usedInColumn = {
        key: 'usedIn',
        name: formatMessage('Used in:'),
        fieldName: 'usedIn',
        minWidth: 100,
        maxWidth: 200,
        data: 'string',
        onRender: item => {
          const usedDialogsLinks = templateUsedInDialogMap[item.Name].map(name => {
            return <Link key={name}>{name}</Link>;
          });

          return <div>{usedDialogsLinks}</div>;
        },
      };

      tableColums.splice(2, 0, usedInColumn);
    }

    return tableColums;
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
    // do not allow add template in particular dialog
    // cause new tempalte is not used by this dialog yet.
    if (activeDialog) return <div />;

    return (
      <div data-testid="formFooter">
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
          {formatMessage('New template')}
        </ActionButton>
      </div>
    );
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
          columns={getTableColums()}
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
