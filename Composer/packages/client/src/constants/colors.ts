// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from 'office-ui-fabric-react/lib/Styling';

const theme = getTheme();

const semColors = theme.semanticColors;

export const colors = {
  // copied from https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/messaging
  errorBg: semColors.errorBackground,
  errorFg: semColors.errorText,
  errorIcon: semColors.errorIcon,

  warningBg: semColors.warningBackground,
  warningFg: semColors.messageText, // warningIcon is deprecated
  warningIcon: theme.palette.yellow, // the official warningIcon color is gray, so we override it here

  successBg: semColors.successBackground,
  successFg: semColors.messageText, // successIcon is also deprecated
  successIcon: semColors.successIcon,
};
