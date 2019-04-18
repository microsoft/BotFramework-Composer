/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import debounce from 'lodash.debounce';
import { Fragment, useContext, useRef } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { Store } from '../../../store/index';

import { scrollablePaneRoot, title, label } from './styles';

export function LanguageGenerationSettings() {
  const { state, actions } = useContext(Store);
  const { lgTemplates } = state;
  const updateLG = useRef(debounce(actions.updateLG, 500)).current;

  function updateTemplateContent(index, lgName, templateName, content) {
    let updatedLG = '';
    lgTemplates[index].name = templateName;
    lgTemplates[index].content = content;
    lgTemplates
      .filter(template => template.fileName === lgName)
      .forEach(template => {
        if (template.comments) {
          updatedLG += `${template.comments}`;
        }
        if (template.name) {
          updatedLG += `# ${template.name}` + '\n';
          updatedLG += `${template.content}` + '\n';
        }
      });

    const payload = {
      name: lgName,
      content: updatedLG.trim('\n'),
    };

    updateLG(payload);
  }

  function getTemplatePhrase(index, lgName, templateName, content) {
    return (
      <TextField
        borderless
        multiline
        autoAdjustHeight
        placeholder="Template Content."
        defaultValue={content}
        onChange={(event, newValue) => updateTemplateContent(index, lgName, templateName, newValue)}
      />
    );
  }

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
          // eslint-disable-next-line react/display-name
          onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  const items = [];
  if (lgTemplates) {
    lgTemplates.forEach(template => {
      items.push({
        name: template.name,
        value: template.name,
        fileName: template.fileName,
        type: template.type,
        content: template.content,
        comments: template.comments,
      });
    });
  }

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
      onRender: (item, index) => {
        return (
          <span>
            <TextField
              borderless
              placeholder="Template Name."
              defaultValue={item.name}
              onChange={(event, newName) => updateTemplateContent(index, item.fileName, newName, item.content)}
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
      onRender: (item, index) => {
        return <span>{getTemplatePhrase(index, item.fileName, item.name, item.content)}</span>;
      },
    },
  ];

  return (
    <Fragment>
      <div>
        <div css={title}>Content &gt; Language Generation</div>
        <div css={label}>Templates</div>
        <ScrollablePane css={scrollablePaneRoot} scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={items}
            compact={false}
            columns={tableColums}
            setKey="key"
            layoutMode={DetailsListLayoutMode.fixedColumns}
            onRenderDetailsHeader={onRenderDetailsHeader}
            selectionMode={SelectionMode.none}
            selectionPreservedOnEmptyClick={true}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
}
