// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';

import TelemetryClient from '../../telemetry/TelemetryClient';

import { h3Style, ulStyle, liStyle } from './styles';

const linkToAdaptiveExpressions =
  'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-adaptive-expressions?view=azure-bot-service-4.0&tabs=arithmetic';
const linkToGetStarted = 'https://docs.microsoft.com/en-us/composer/introduction';
const linkToCreateFirstBot = 'https://docs.microsoft.com/en-us/composer/quickstart-create-bot';
const linkToTutorials = 'https://docs.microsoft.com/en-us/composer/tutorial/tutorial-introduction';
const linkToLGFileFormat =
  'https://docs.microsoft.com/en-us/azure/bot-service/file-format/bot-builder-lg-file-format?view=azure-bot-service-4.0';
const linkToLUFileFormat =
  'https://docs.microsoft.com/en-us/azure/bot-service/file-format/bot-builder-lu-file-format?view=azure-bot-service-4.0';
const linkToPreBuiltExpressions =
  'https://docs.microsoft.com/en-us/azure/bot-service/adaptive-expressions/adaptive-expressions-prebuilt-functions?view=azure-bot-service-4.0';

const linkClick = (event) => {
  TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: event.target.href });
};

export const GetStartedLearn: React.FC = () => {
  return (
    <div css={{ paddingLeft: 27, paddingRight: 20 }}>
      <p>{formatMessage('These are next steps so you always know what to do next to get your bot going.')}</p>

      <h3 style={h3Style}>{formatMessage('Get started')}</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link href={linkToGetStarted} target="_blank" onClick={linkClick}>
            {formatMessage('Get started with Bot Framework Composer')}
          </Link>
        </li>
        <li style={liStyle}>
          <Link href={linkToCreateFirstBot} target="_blank" onClick={linkClick}>
            {formatMessage('Create your first bot')}
          </Link>
        </li>
        <li style={liStyle}>
          <Link href={linkToTutorials} target="_blank" onClick={linkClick}>
            {formatMessage('Composer tutorials')}
          </Link>
        </li>
      </ul>

      <h3 style={h3Style}>{formatMessage('Quick references')}</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link href={linkToAdaptiveExpressions} target="_blank" onClick={linkClick}>
            {formatMessage('Learn about Adaptive expressions')}
          </Link>
        </li>
        <li style={liStyle}>
          <Link href={linkToPreBuiltExpressions} target="_blank" onClick={linkClick}>
            {formatMessage('Find pre-built Adaptive expressions')}
          </Link>
        </li>
        <li style={liStyle}>
          <Link href={linkToLUFileFormat} target="_blank" onClick={linkClick}>
            {formatMessage('LU file format and syntax')}
          </Link>
        </li>
        <li style={liStyle}>
          <Link href={linkToLGFileFormat} target="_blank" onClick={linkClick}>
            {formatMessage('LG file format and syntax')}
          </Link>
        </li>
      </ul>
    </div>
  );
};
