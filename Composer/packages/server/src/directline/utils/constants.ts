// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const authentication = {
  channelService: 'https://dev.botframework.com/',
  tokenEndpoint: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
  openIdMetadata: 'https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration',
  botTokenAudience: 'https://api.botframework.com',
};

export const usGovernmentAuthentication = {
  channelService: 'https://botframework.azure.us',
  tokenEndpoint: 'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/oauth2/v2.0/token',
  openIdMetadata:
    'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0/.well-known/openid-configuration',
  botTokenAudience: 'https://api.botframework.us',
  tokenIssuerV1: 'https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/',
  tokenIssuerV2: 'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0',
};

export const v31Authentication = {
  tokenIssuer: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
};

export const v32Authentication = {
  tokenIssuerV1: 'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',
  tokenIssuerV2: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0',
};

export const speech = {
  // Access token for Cognitive Services API
  tokenEndpoint: 'https://login.botframework.com/v3/speechtoken/speechservices',
};

export enum AttachmentContentTypes {
  animationCard = 'application/vnd.microsoft.card.animation',
  audioCard = 'application/vnd.microsoft.card.audio',
  heroCard = 'application/vnd.microsoft.card.hero',
  receiptCard = 'application/vnd.microsoft.card.receipt',
  signInCard = 'application/vnd.microsoft.card.signin',
  oAuthCard = 'application/vnd.microsoft.card.oauth',
  thumbnailCard = 'application/vnd.microsoft.card.thumbnail',
  videoCard = 'application/vnd.microsoft.card.video',
}
