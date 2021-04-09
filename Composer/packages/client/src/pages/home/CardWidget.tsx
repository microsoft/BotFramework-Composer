// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React, { useState } from 'react';
import { Image, ImageFit, ImageLoadState } from 'office-ui-fabric-react/lib/Image';
import { Link } from 'office-ui-fabric-react/lib/Link';

import defaultArticleCardCover from '../../images/defaultArticleCardCover.svg';
import defaultVideoCardCover from '../../images/defaultVideoCardCover.svg';

import { itemContainerWrapper } from './styles';
import * as home from './styles';

export interface CardWidgetProps {
  onClick?: () => void | Promise<void>;
  cardType: 'resource' | 'video' | 'article';
  imageCover: string;
  title: string | JSX.Element;
  subContent?: string;
  content: string;
  styles?: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    imageCover?: SerializedStyles;
    content?: SerializedStyles;
    moreLink?: SerializedStyles;
  };
  disabled?: boolean;
  forwardedRef?: (project: any) => void | Promise<void>;
  openExternal?: boolean;
  moreLinkText?: string;
  ariaLabel: string;
}

export const CardWidget: React.FC<CardWidgetProps> = ({
  onClick = undefined,
  title,
  content,
  subContent,
  disabled,
  forwardedRef,
  openExternal,
  ariaLabel,
  imageCover,
  cardType,
  moreLinkText,
  ...rest
}) => {
  const defaultImageCover = cardType === 'video' ? defaultVideoCardCover : defaultArticleCardCover;
  const [usedImageCover, setUsedImageCover] = useState(imageCover || defaultImageCover);
  const [useImageBackground, setUseImageBackground] = useState(false);
  const styles =
    rest.styles || cardType === 'resource'
      ? home.cardItem
      : imageCover
      ? home.mediaCardItem
      : home.meidiaCardNoCoverItem;

  const onImageLoading = (state: ImageLoadState) => {
    if (state === ImageLoadState.error) {
      setUsedImageCover(defaultImageCover);
    }
  };

  // const onImageLoadError = () => {
  //     setUsedImageCover(defaultImageCover);
  // };

  // detect image cover dimention to decide apply blur background or not.
  const onImgLoaded = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const whRatio = rect.width / rect.height;
    if (whRatio > 260 / 100 || whRatio < 240 / 100) {
      setUseImageBackground(true);
    }
  };

  return (
    <div
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async (e) => {
        if (onClick != null) {
          e.preventDefault();
          await onClick();
        }
      }}
      {...rest}
    >
      <div ref={forwardedRef} aria-label={ariaLabel}>
        <div css={styles.imageCover}>
          {useImageBackground && (
            <div className={'image-cover-background'} style={{ backgroundImage: `url(${usedImageCover})` }}></div>
          )}
          <Image
            alt={ariaLabel}
            aria-label={ariaLabel}
            className={'image-cover-img'}
            imageFit={ImageFit.centerContain}
            src={usedImageCover}
            onLoad={onImgLoaded}
            onLoadingStateChange={onImageLoading}
          />
        </div>
        <div css={styles.title}>{title}</div>
        <div css={styles.content}>{content}</div>
        {moreLinkText && <Link css={styles.moreLink}> {moreLinkText} </Link>}
      </div>
    </div>
  );
};
