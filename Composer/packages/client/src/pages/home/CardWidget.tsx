// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React, { useState, useRef } from 'react';
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
  href?: string;
  target?: string;
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
  href,
  target = '_blank',
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
  const [appliedImageCover, setAppliedImageCover] = useState<string>(imageCover ?? defaultImageCover);
  const imageContainerEl = useRef<HTMLDivElement>(null);
  const styles =
    rest.styles || cardType === 'resource'
      ? home.cardItem
      : imageCover
      ? home.mediaCardItem
      : home.meidiaCardNoCoverItem;

  const onImageLoading = (state: ImageLoadState) => {
    if (state === ImageLoadState.error) {
      setAppliedImageCover(defaultImageCover);
    }
  };

  return (
    <a
      css={[itemContainerWrapper(disabled), styles.container]}
      href={href}
      target={target}
      onClick={async (e) => {
        if (onClick != null) {
          e.preventDefault();
          await onClick();
        }
      }}
      {...rest}
    >
      <div ref={forwardedRef} aria-label={ariaLabel}>
        <div ref={imageContainerEl} css={styles.imageCover}>
          <Image
            className={'image-cover-img'}
            imageFit={ImageFit.contain}
            src={appliedImageCover}
            onLoadingStateChange={onImageLoading}
          />
        </div>
        <div css={styles.title}>{title}</div>
        <div css={styles.content}>{content}</div>
        {moreLinkText && <Link css={styles.moreLink}> {moreLinkText} </Link>}
      </div>
    </a>
  );
};
