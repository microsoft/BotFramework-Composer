/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { PropTypes } from 'prop-types';
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
import { navigate } from '@reach/router';

import { Store } from '../../store/index';
import { actionButton, formCell } from '../language-understanding/styles';

export default function TableView(props) {
  const { state, actions } = useContext(Store);
  const { clearNavHistory, navTo } = actions;
  const { dialogs } = state;
  const lgFile = props.file;
  const activeDialog = props.activeDialog;
  const createLgTemplate = useRef(debounce(actions.createLgTemplate, 500)).current;
  const removeLgTemplate = useRef(debounce(actions.removeLgTemplate, 500)).current;
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

  function navigateToDialog(name) {
    clearNavHistory();
    navTo(`${name}#`);
    navigate('/');
  }

  const getTemplatesMoreButtons = (item, index) => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          props.onEdit(templates[index]);
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
            return (
              <div key={name} onClick={() => navigateToDialog(name)}>
                <Link>{name}</Link>
              </div>
            );
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
      <div data-testid="tableHeader">
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
      <div data-testid="tableFooter">
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
          {formatMessage('New template')}
        </ActionButton>
      </div>
    );
  }

  function onCreateNewTemplate() {
    const copyName = 'TemplateName';

    // if duplicate, increse name with TemplateName1 TemplateName2 ...
    let repeatIndex = 0;
    let newName = copyName;
    while (templates.findIndex(item => item.Name === newName) !== -1) {
      repeatIndex += 1;
      newName = copyName + repeatIndex.toString();
    }
    const payload = {
      file: lgFile,
      template: {
        Name: newName,
        Body: '-TemplateValue',
      },
    };
    createLgTemplate(payload);
  }

  function onRemoveTemplate(index) {
    const payload = {
      file: lgFile,
      templateName: templates[index].Name,
    };

    removeLgTemplate(payload);
  }

  function onCopyTemplate(index) {
    const newItems = [...templates];
    const copyName = `${newItems[index].Name}.Copy`;

    // if duplicate, increse name with Copy1 Copy2 ...
    let repeatIndex = 0;
    let newName = copyName;

    while (templates.findIndex(item => item.Name === newName) !== -1) {
      repeatIndex += 1;
      newName = copyName + repeatIndex.toString();
    }

    const payload = {
      file: lgFile,
      template: {
        Name: newName,
        Body: newItems[index].Body,
      },
    };
    createLgTemplate(payload);
  }

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          componentRef={listRef}
          items={templates}
          styles={{
            root: {
              overflowX: 'hidden',
            },
          }}
          className="table-view-list"
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

TableView.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func,
  activeDialog: PropTypes.object,
  onEdit: PropTypes.func,
};
