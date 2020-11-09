// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState } from 'react';
import formatMessage from 'format-message';
import { FeatureFlag, FeatureFlagKey } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { dispatcherState, featureFlagsState } from '../../../recoilModel';

import { featureFlagGroupContainer, noFeatureFlagText } from './styles';
import { SettingToggle } from './SettingToggle';
import * as images from './images';
import { FeatureFlagCheckBox } from './FeatureFlagCheckBox';

export const PreviewFeatureToggle: React.FC = () => {
  const featureFlags = useRecoilValue(featureFlagsState);
  const { toggleFeatureFlag } = useRecoilValue(dispatcherState);
  const [featureFlagVisible, showFeatureFlag] = useState(false);

  const renderFeatureFlagOptions = () => {
    const result: React.ReactNode[] = [];
    Object.keys(featureFlags).forEach((key: string) => {
      const featureFlag: FeatureFlag = featureFlags[key];
      if (!featureFlag.isHidden) {
        result.push(
          <FeatureFlagCheckBox
            key={key}
            description={featureFlag.description}
            enabled={featureFlag.enabled}
            featureFlagKey={key as FeatureFlagKey}
            featureFlagName={featureFlag.displayName}
            toggleFeatureFlag={toggleFeatureFlag}
          />
        );
      }
    });
    if (result.length === 0) {
      result.push(<span css={noFeatureFlagText}>{formatMessage('There are no preview features at this time.')}</span>);
    }
    return <div css={featureFlagGroupContainer}>{result}</div>;
  };

  return (
    <Fragment>
      <SettingToggle
        hideToggle
        checked={featureFlagVisible}
        description={formatMessage(
          'Try new features in preview and help us make Composer better. You can turn them on or off at any time.'
        )}
        image={images.previewFeatures}
        title={formatMessage('Preview features')}
        onToggle={(checked: boolean) => {
          showFeatureFlag(checked);
        }}
      />
      {renderFeatureFlagOptions()}
    </Fragment>
  );
};
