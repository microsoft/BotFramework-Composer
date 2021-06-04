// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import { colors } from '../../../colors';

export default {
  backgroundColor: NeutralColors.white,
  accent: colors.main,
  subtle: colors.gray(10),

  primaryFont: 'Segoe UI, HelveticaNeue-Light, Ubuntu, Droid Sans, sans-serif',

  bubbleBackground: colors.gray(10),
  bubbleFromUserBackground: colors.main,
  bubbleFromUserTextColor: NeutralColors.white,
  bubbleTextColor: NeutralColors.black,
  bubbleMinHeight: 20,

  microphoneButtonColorOnDictate: SharedColors.red10,
  sendBoxButtonColor: colors.gray(130),
  sendBoxButtonColorOnFocus: colors.gray(140),
  sendBoxButtonColorOnHover: colors.gray(150),
  sendBoxTextColor: NeutralColors.black,
  sendBoxPlaceholderColor: colors.gray(150),
  timestampColor: colors.gray(130),
  suggestedActionBackground: colors.gray(10),
  suggestedActionBorderColor: 'transparent',
  suggestedActionBorderStyle: 'solid',
  suggestedActionBorderWidth: 0,
  suggestedActionTextColor: colors.main,

  transcriptOverlayButtonBackground: 'rgba(48, 98, 214, 0.8)',
  transcriptOverlayButtonBackgroundOnFocus: 'rgba(34, 76, 174, .8)',
  transcriptOverlayButtonBackgroundOnHover: 'rgba(34, 76, 174, .8)',
  transcriptOverlayButtonColor: colors.gray(10),
  transcriptOverlayButtonColorOnFocus: colors.gray(10),
  transcriptOverlayButtonColorOnHover: colors.gray(10),
  transcriptActivityVisualKeyboardIndicatorWidth: 1,
  transcriptVisualKeyboardIndicatorColor: colors.main,
  transcriptVisualKeyboardIndicatorStyle: 'solid',
  transcriptVisualKeyboardIndicatorWidth: 2,
};
