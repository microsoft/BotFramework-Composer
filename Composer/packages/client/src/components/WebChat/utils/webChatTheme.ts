// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { NeutralColors, CommunicationColors, SharedColors } from '@uifabric/fluent-theme';

export default {
  backgroundColor: `${NeutralColors.white}`,
  accent: `${CommunicationColors.primary}`,
  subtle: `${NeutralColors.gray10}`,

  primaryFont: 'Segoe UI, HelveticaNeue-Light, Ubuntu, Droid Sans, sans-serif',

  bubbleBackground: `${NeutralColors.gray10}`,
  bubbleFromUserBackground: `${CommunicationColors.primary}`,
  bubbleFromUserTextColor: `${NeutralColors.white}`,
  bubbleTextColor: `${NeutralColors.black}`,
  bubbleMinHeight: 20,

  microphoneButtonColorOnDictate: `${SharedColors.red10}`,
  sendBoxBackground: `${NeutralColors.white}`,
  sendBoxButtonColor: `${NeutralColors.gray130}`,
  sendBoxButtonColorOnFocus: `${NeutralColors.gray140}`,
  sendBoxButtonColorOnHover: `${NeutralColors.gray150}`,
  sendBoxTextColor: 'initial',

  timestampColor: `${NeutralColors.gray130}`,

  suggestedActionBackground: `${NeutralColors.gray10}`,
  suggestedActionBorderColor: 'transparent',
  suggestedActionBorderStyle: 'solid',
  suggestedActionBorderWidth: 0,
  suggestedActionTextColor: `${CommunicationColors.primary}`,

  transcriptOverlayButtonBackground: 'rgba(48, 98, 214, 0.8)',
  transcriptOverlayButtonBackgroundOnFocus: 'rgba(34, 76, 174, .8)',
  transcriptOverlayButtonBackgroundOnHover: 'rgba(34, 76, 174, .8)',
  transcriptOverlayButtonColor: `${NeutralColors.gray10}`,
  transcriptOverlayButtonColorOnFocus: `${NeutralColors.gray10}`,
  transcriptOverlayButtonColorOnHover: `${NeutralColors.gray10}`,
};
