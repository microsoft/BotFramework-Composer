/* eslint-disable react/display-name */
/* eslint-disable no-unused-vars */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';

import { Store } from '../../../store/index';

import { scrollablePaneRoot, title, label } from './styles';

export function LanguageGenerationSettings() {
  const { state } = useContext(Store);
  const { lgTemplates } = state;
  let currentFileContent = '';

  lgTemplates.forEach(lgTemplate => (currentFileContent = lgTemplate.content.toString()));

  // todo: use lg parser.
  const templates = [];
  const templateStrings = currentFileContent.split('#').filter(line => line);
  templateStrings.forEach(temp => {
    const lines = temp.match(/^.+$/gm);
    const newTemplate = {
      responses: [],
    };
    const cases = {
      default: '',
      condition: '',
      list: [],
    };
    let currentSet = '';
    let response = '';
    let isMutiLineResponse = false;
    lines.forEach((innerLine, index) => {
      if (!innerLine.trim() || innerLine.startsWith('>')) return;

      if (index === 0) {
        newTemplate.name = innerLine;
        return;
      }
      if (innerLine.startsWith('- CASE')) {
        currentSet = 'case';
        cases.condition = innerLine.split('- CASE: ')[1].trim();
        return;
      } else if (innerLine.startsWith('- DEFAULT')) {
        currentSet = 'default';
      } else if (innerLine.startsWith('-')) {
        currentSet = 'response';
        const re = innerLine.split('-')[1].trim();
        isMutiLineResponse = re === '```';
        if (isMutiLineResponse) {
          return;
        }
        newTemplate.responses.push(re);
        return;
      }

      if (currentSet === 'case') {
        const ca = innerLine.substr(innerLine.indexOf('-') + 2).trim();
        cases.list.push(ca);
      }
      if (currentSet === 'default') {
        const de = innerLine.substr(innerLine.indexOf('-') + 2).trim();
        cases.default = de;
      }
      if (currentSet === 'response' && innerLine.trim() === '```') {
        newTemplate.responses.push(response);
        currentSet = '';
        response = '';
      } else if (currentSet === 'response') {
        response += innerLine;
      }
    });
    if (cases.default) {
      newTemplate.type = 'Condition';
      newTemplate.cases = cases;
    } else {
      newTemplate.type = 'Rotate';
    }
    if (newTemplate.name) {
      templates.push(newTemplate);
    }
  });

  function getTemplatePhrase(template) {
    if (template.type === 'Rotate') {
      return getRotateTemplate(template);
    } else {
      return getConditionTemplate(template);
    }
  }

  function getRotateTemplate(template) {
    return template.responses.map((res, index) => {
      return <div key={index}> - {res}</div>;
    });
  }

  function getConditionTemplate(template) {
    return (
      <div>
        {getDefaultCase(template)}
        {getOtherCases(template)}
      </div>
    );
  }

  function getDefaultCase(template) {
    return <div>default: {template.cases.default}</div>;
  }

  function getOtherCases(template) {
    const cases = template.cases.list.map((condition, index) => {
      return <div key={index}> - {condition}</div>;
    });

    return (
      <div>
        <div>case: {template.cases.condition}</div>
        {cases}
      </div>
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
  if (templates) {
    templates.forEach(template => {
      items.push({
        name: template.name,
        value: template.name,
        type: template.type,
        content: template,
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
      onRender: item => {
        return <span>{item.name}</span>;
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
        return <span>{getTemplatePhrase(item.content)}</span>;
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
