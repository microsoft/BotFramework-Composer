// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import defaultArticleCardCover from '../../images/defaultArticleCardCover.svg';
import defaultVideoCardCover from '../../images/defaultVideoCardCover.svg';

import { ItemContainer, ItemContainerProps } from './ItemContainer';
import * as home from './styles';

interface CardWidgetProps extends ItemContainerProps {
  cardType: 'resource' | 'video' | 'article';
}

export const CardWidget: React.FC<CardWidgetProps> = (props) => {
  const styles =
    props.cardType === 'resource' ? home.cardItem : props.imageCover ? home.mediaCardItem : home.meidiaCardNoCoverItem;
  const imageCover = props.imageCover || (props.cardType === 'video' ? defaultVideoCardCover : defaultArticleCardCover);
  return <ItemContainer {...props} imageCover={imageCover} styles={styles} />;
};
