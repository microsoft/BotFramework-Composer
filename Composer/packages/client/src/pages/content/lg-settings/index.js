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
  // const { files } = state;

  // const lgFiles = files.filter(file => file.name.includes('.lg'));
  const currentFileContent =
    "    \n> LG files define templates that help with language generation. \n> LG files are similar to LU files - markdown files; simple text files to manage bot's responses\n\n> Welcome template with variations as a markdown list\n> LG engine will resolve this template to one of the provided variations\n\n# WelcomeTemplate\n- Hi\n- Hello\n- Howdy\n\n> Templates can refer to other templates. Template references are enclosed in square brackets - []\n# GreetingTemplate\n- [WelcomeTemplate], what can I do for you today?\n\n> Templates can refer to entities as well. Entity references are enclosed in curly brackets - {}\n# EchoTemplate\n- [EchoPrefix] '{Activity.Text}'\n\n# EchoPrefix\n- You said\n- Roger\n- I picked up\n\n> Templates can include expressions as conditions and inline variations\n# WordGameReply\n- CASE: {GameName == 'MarcoPolo'}\n    - [WelcomeTemplate] Polo\n    - Welcome back Polo!\n- CASE: {GameName == 'HipHip'}\n    - [WelcomeTemplate] Hurray\n- DEFAULT:\n    - [WelcomeTemplate]\n\n> Templates can be parametrized\n# TimeOfDayReadOut(parameter1)\n- CASE: {parameter1 == 'morning'}\n    - Good morning\n    - Its a wonderful morning!\n- DEFAULT:\n    - Good evening\n\n# TimeOfDayExmple\n- [TimeOfDayReadOut(timeOfDay)]\n- Uh, ask me that again.. Just for fun.\n\n> You can have multi-line responses with template resolution. Multi-line content is enclosed in ```. \n> Resolution applied to content within @{}\n> \\ is escape charater.\n# MultiLineExample\n- ```\n    This is a multi-line list\n    - one\n    - two\n    - Greeting: @{[WelcomeTemplate]}\n```\n- ```\n    This a variation\n    - three\n    - Greeting: @{[WelcomeTemplate]}\n```\n\n> You can include custom payload in multi-line resolution, use this for cards etc.\n# CardExample\n- ```\n    {\n        \"Title\": \"@{[WelcomeTemplate]}\",\n        \"Images\": [\n            {\n                \"url\": \"@{[ImageCollection]}\"\n            }\n        ],\n        \"SubTitle\": \"This is an exmple of a card. @{[GreetingTemplate]}\",\n        \"Text\": \"This is a Hero Card example\"\n    }\n    ```\n\n# ImageCollection\n- https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg\n- https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png\n\n\n>> Other cool features::\n> Inline expressions in variations\n> Pre-defined functions to use in expressions \n> Ability to independently update bot's response assets without need to redeploy bot\n> Simple text file format to easily integrate with your existing development processes\n> Command line tools to parse, validate and collate LG files\n\n> \n> [Today,] you can expect a [high] of {high} [and] tomorrow looks really [good] \n> [Tonight,] you can expect a [low] of {low} [but] tomorrow looks really [bad]\n\n # PartOfDay\n- CASE: {partOfDay == 'morning'}\n    - Today \n    - This morning \n- CASE: {partOfDay == 'night'}\n    - Tonight \n    - This evining\n- DEFAULT:\n    - error PartOfDay\n \n# HighLow\n- CASE: {partOfDay == 'morning'}\n    - high\n- CASE: {partOfDay == 'night'}\n    - low\n- DEFAULT:\n    - error HighLow\n\n# ConjunctureTemplate \n- CASE: {isAGoodDay == 'true'}\n    - and\n- CASE: {isAGoodDay == 'false'}\n    - but\n- DEFAULT:\n    - error ConjunctureTemplate \n\n# TempByPartOfDay\n- CASE: {partOfDay == 'morning'}\n    - {high}\n- CASE: {partOfDay == 'night'}\n    - {low}\n- DEFAULT:\n    - error TempByPartOfDay\n\n# GoodBad\n- CASE: {isAGoodDay == 'true'}\n    - good\n- CASE: {isAGoodDay == 'false'}\n    - bad\n- DEFAULT:\n    - error GoodBad\n\n# WeatherForecast\n- [PartOfDay], you can expect a [HighLow] of [TempByPartOfDay] [ConjunctureTemplate] tomorrow looks really [GoodBad]"; //lgFiles.length > 0 ? lgFiles[0].content.content : '';

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
