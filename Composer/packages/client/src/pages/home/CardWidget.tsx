// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React, { useState } from 'react';
import { DefaultButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Image, ImageFit, ImageLoadState } from 'office-ui-fabric-react/lib/Image';
import { Link } from 'office-ui-fabric-react/lib/Link';

import defaultArticleCardCover from '../../images/defaultArticleCardCover.svg';
import defaultVideoCardCover from '../../images/defaultVideoCardCover.svg';

import { itemContainerWrapper } from './styles';
import * as home from './styles';

export interface CardWidgetProps extends Omit<IButtonProps, 'onChange' | 'styles' | 'title'> {
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

  const onRenderChildren = () => {
    return (
      <div ref={forwardedRef} aria-label={ariaLabel}>
        <div css={styles.imageCover}>
          <div className={'image-cover-background'} style={{ backgroundImage: `url(${usedImageCover})` }}></div>
          <Image
            alt={ariaLabel}
            aria-label={ariaLabel}
            className={'image-cover-img'}
            imageFit={ImageFit.contain}
            src={usedImageCover}
            onLoadingStateChange={onImageLoading}
          />
        </div>
        <div css={styles.title}>{title}</div>
        <div css={styles.content}>{content}</div>
        {moreLinkText && <Link css={styles.moreLink}> {moreLinkText} </Link>}
      </div>
    );
  };

  return (
    <DefaultButton
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async (e) => {
        if (onClick != null) {
          e.preventDefault();
          await onClick();
        }
      }}
      {...rest}
      disabled={disabled}
      styles={{ flexContainer: { display: 'block' } }}
      onRenderChildren={onRenderChildren}
    />
  );
};
