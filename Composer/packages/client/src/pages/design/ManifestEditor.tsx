// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import ErrorBoundary from 'react-error-boundary';
import React from 'react';
import { LoadingTimeout } from '@bfc/adaptive-form/lib/components/LoadingTimeout';
import { FieldLabel } from '@bfc/adaptive-form/lib/components/FieldLabel';
import ErrorInfo from '@bfc/adaptive-form/lib/components/ErrorInfo';
import { FontSizes } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontWeights } from '@uifabric/styling';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import get from 'lodash/get';

import { SkillInfo } from '../../recoilModel';

import { formEditor } from './styles';

const styles = {
  errorLoading: css`
    padding: 18px;
  `,

  banner: css`
    border-bottom: 1px solid #c8c6c4;
    padding: 0 18px;
    margin-bottom: 0px;
  `,

  title: css`
    font-size: ${FontSizes.size20};
    font-weight: ${FontWeights.semibold};
    margin: '5px 0 7px -9px';
  `,

  subtitle: css`
    height: 15px;
    line-height: 15px;
    font-size: ${FontSizes.size12};
    color: #4f4f4f;
    margin: -7px 0 7px;
  `,

  description: css`
    margin-top: 0;
    margin-bottom: 10px;
    white-space: pre-line;
    font-size: ${FontSizes.size12};
  `,

  body: css`
    padding: 0 18px;
    font-size: ${FontSizes.size12};
    section {
      padding-top: 20px;
    }
    label {
      color: #585756;
      font-size: ${FontSizes.size12};
    }
    .ms-DetailsHeader {
      padding-top: 0;
    }
  `,
};

const helpLink =
  'https://docs.microsoft.com/en-us/azure/bot-service/skills-write-manifest-2-1?view=azure-bot-service-4.0';

export interface ManifestEditorProps {
  formData: SkillInfo;
}

export const ManifestEditor: React.FC<ManifestEditorProps> = (props) => {
  const { formData } = props;
  const { manifest } = formData;

  if (!manifest) {
    return (
      <LoadingTimeout timeout={2000}>
        <div css={styles.errorLoading}>{formatMessage('Manifest could not be loaded')}</div>
      </LoadingTimeout>
    );
  }

  const activities = get(manifest, 'activities', {});
  const activitiesToDisplay: { name: string; description: string }[] = [];

  for (const key in activities) {
    activitiesToDisplay.push({
      name: get(activities, [key, 'name'], key),
      description: get(activities, [key, 'description'], ''),
    });
  }

  return (
    <div aria-label={formatMessage('manifest editor')} css={formEditor} data-testid="ManifestEditor" role="region">
      <ErrorBoundary FallbackComponent={ErrorInfo}>
        <div css={styles.banner}>
          <p css={styles.title}>
            {' '}
            {formData.name} {'(Remote)'}
          </p>
          <p css={styles.subtitle}> {formatMessage('Remote skill')} </p>
          <p css={styles.description}>
            {manifest.description}
            <React.Fragment>
              <br />
              <br />
              <Link
                aria-label={formatMessage('Learn more about skill manifest')}
                href={helpLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                {formatMessage('Learn more')}
              </Link>
            </React.Fragment>
          </p>
        </div>

        <div css={styles.body}>
          <section>
            <FieldLabel
              description={formatMessage('Learn more about manifest')}
              helpLink={helpLink}
              id={'url'}
              label={formatMessage('Manifest url')}
            />
            <p>{formData.location}</p>
          </section>
          <section>
            <FieldLabel
              description={formatMessage('Learn more about endpoints')}
              helpLink={helpLink}
              id={'endpoints'}
              label={formatMessage('Endpoints')}
            />
            <DetailsList
              columns={[
                { key: 'Name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
                { key: 'EndpointUrl', name: 'EndpointUrl', fieldName: 'endpointUrl', minWidth: 100, isResizable: true },
              ]}
              items={get(manifest, 'endpoints', [])}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
          </section>
          <section>
            <FieldLabel
              description={formatMessage('Learn more about activities')}
              helpLink={helpLink}
              id={'activities'}
              label={formatMessage('Activities')}
            />
            <DetailsList
              columns={[
                { key: 'Name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
                { key: 'Description', name: 'Description', fieldName: 'description', minWidth: 100, isResizable: true },
              ]}
              items={activitiesToDisplay}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
          </section>
        </div>
      </ErrorBoundary>
    </div>
  );
};
