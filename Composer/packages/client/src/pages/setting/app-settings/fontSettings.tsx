// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { useId } from '@uifabric/react-hooks';
import kebabCase from 'lodash/kebabCase';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import formatMessage from 'format-message';

import { getDefaultFontSettings } from '../../../recoilModel/utils/fontUtil';

import * as styles from './styles';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();
interface IFontSettingsProps {
  id?: string;
  description: React.ReactChild;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  image?: string;
  title: string;
  onChange: (value: Record<string, string | number>) => void;
}

const FontSettings: React.FC<IFontSettingsProps> = (props) => {
  const { id, title, description, image, fontFamily, fontWeight, fontSize, onChange } = props;
  const uniqueId = useId(kebabCase(title));

  return (
    <div css={styles.settingsContainer}>
      <div aria-hidden="true" css={styles.image} role="presentation">
        {image && <img aria-hidden alt={''} src={image} />}
      </div>
      <div css={styles.settingsContent}>
        <Label htmlFor={id || uniqueId} styles={{ root: { padding: 0 } }}>
          {title}
        </Label>
        <p css={styles.settingsDescription}>{description}</p>
      </div>
      <Stack tokens={{ childrenGap: 20 }}>
        <TextField
          data-testid="FontFamily"
          label={formatMessage('Font family')}
          value={fontFamily}
          onChange={(_e, val) => {
            onChange({ fontFamily: String(val || DEFAULT_FONT_SETTINGS.fontFamily), fontSize, fontWeight });
          }}
        />
        <TextField
          data-testid="FontSize"
          label={formatMessage('Font size')}
          value={fontSize}
          onChange={(_e, val) => {
            onChange({ fontSize: String(val || DEFAULT_FONT_SETTINGS.fontSize), fontFamily, fontWeight });
          }}
        />
        <TextField
          data-testid="FontWeight"
          label={formatMessage('Font weight')}
          value={fontWeight}
          onChange={(_e, val) => {
            onChange({ fontWeight: Number(val || DEFAULT_FONT_SETTINGS.fontWeight), fontSize, fontFamily });
          }}
        />
      </Stack>
    </div>
  );
};

export { FontSettings };
