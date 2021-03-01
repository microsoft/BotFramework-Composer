// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const activityTemplateType = 'Activity';

export const jsLgToolbarMenuClassName = 'js-lg-toolbar-menu';

export const lgCardAttachmentTemplates = [
  'adaptive',
  'hero',
  'signin',
  'thumbnail',
  'audio',
  'video',
  'animation',
] as const;

export type LgCardTemplateType = typeof lgCardAttachmentTemplates[number];

export const cardTemplates: Record<LgCardTemplateType, string> = {
  adaptive: `> To learn more Adaptive Cards format, read the documentation at
> https://docs.microsoft.com/en-us/adaptive-cards/getting-started/bots
- \`\`\`\${json({
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.2",
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "text": "default text",
      "weight": "bolder",
      "isSubtle": false
    }
  ]
})}\`\`\``,
  hero: `[HeroCard
  title =
  subtitle =
  text =
  images =
  buttons =
]
`,
  thumbnail: `[ThumbnailCard
  title =
  subtitle =
  text =
  image =
  buttons =
]`,
  signin: `[SigninCard
    text =
    buttons =
]`,
  animation: `[AnimationCard
    title =
    subtitle =
    image =
    media =
]`,
  video: `[VideoCard
    title =
    subtitle =
    text =
    image =
    media =
    buttons =
]`,
  audio: `[AudioCard
    title =
    subtitle =
    text =
    image =
    media =
    buttons =
]`,
};
