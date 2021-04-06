// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import { useRecoilValue } from 'recoil';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { dispatcherState } from '../../recoilModel';

import { h3Style, ulStyle, liStyle } from './styles';

const linkToEmulator = 'https://aka.ms/composer-getstarted-emulator';
const linkToQNA = 'https://aka.ms/composer-getstarted-qnamaker';
const linkToPackages = 'https://aka.ms/composer-getstarted-packages';
const linkToImport = 'https://aka.ms/composer-getstarted-importpublishing';
const linkToPVA = 'https://aka.ms/composer-getstarted-pva';
const linkToMigrate = 'https://aka.ms/composer-getstarted-migrate';
const linkToFeatureRequest = 'https://aka.ms/composer-getstarted-featurerequest';

const linkToAdaptiveExpressions = 'https://aka.ms/composer-getstarted-adaptiveexpressions';
const linkToGetStarted = 'https://aka.ms/composer-getstarted-getstarted';
const linkToCreateFirstBot = 'https://aka.ms/composer-getstarted-quickstart';
const linkToTutorials = 'https://aka.ms/composer-getstarted-tutorials';
const linkToLGFileFormat = 'https://aka.ms/composer-getstarted-lgfiles';
const linkToLUFileFormat = 'https://aka.ms/composer-getstarted-lufiles';
const linkToPreBuiltExpressions = 'https://aka.ms/composer-getstarted-prebuilt';

const linkClick = (event) => {
  TelemetryClient.track('GettingStartedLinkClicked', { method: 'link', url: event.target.href });
};

type Props = {
  projectId: string;
  onDismiss: () => void;
};

export const GetStartedLearn: React.FC<Props> = ({ projectId, onDismiss }) => {
  const { navTo, onboardingSetComplete } = useRecoilValue(dispatcherState);

  const onStartProductTourClicked = React.useCallback(() => {
    onboardingSetComplete(false);
    navTo(projectId, null);
    onDismiss();
  }, [onboardingSetComplete, onDismiss]);

  return (
    <ScrollablePane styles={{ root: { marginTop: 60 } }}>
      <div css={{ paddingTop: 20, paddingLeft: 27, paddingRight: 20 }}>
        <h3 style={h3Style}>{formatMessage('Get started')}</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <Link target="_blank" onClick={onStartProductTourClicked}>
              {formatMessage('Take a product tour')}
            </Link>
          </li>
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
          <li style={liStyle}>
            <Link href={linkToEmulator} target="_blank" onClick={linkClick}>
              {formatMessage('Setting up Bot Framework Emulator')}
            </Link>
          </li>
          <li style={liStyle}>
            <Link href={linkToQNA} target="_blank" onClick={linkClick}>
              {formatMessage('QnA Maker introduction')}
            </Link>
          </li>
          <li style={liStyle}>
            <Link href={linkToPackages} target="_blank" onClick={linkClick}>
              {formatMessage('Working with packages')}
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
          <li style={liStyle}>
            <Link href={linkToImport} target="_blank" onClick={linkClick}>
              {formatMessage('Importing a publishing profile')}
            </Link>
          </li>
          <li style={liStyle}>
            <Link href={linkToPVA} target="_blank" onClick={linkClick}>
              {formatMessage('Integrating with Power Virtual Agents')}
            </Link>
          </li>
          <li style={liStyle}>
            <Link href={linkToMigrate} target="_blank" onClick={linkClick}>
              {formatMessage('Migrating to Composer')}
            </Link>
          </li>
          <li style={liStyle}>
            <Link href={linkToFeatureRequest} target="_blank" onClick={linkClick}>
              {formatMessage('Submit a feature request')}
            </Link>
          </li>
        </ul>
      </div>
    </ScrollablePane>
  );
};
