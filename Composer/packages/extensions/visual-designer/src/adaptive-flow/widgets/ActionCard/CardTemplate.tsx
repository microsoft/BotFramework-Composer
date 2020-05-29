// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ReactNode } from 'react';
import { TextDiv } from '@bfc/ui-shared';

import { StandardNodeWidth, HeaderHeight, StandardSectionHeight } from '../../constants/ElementSizes';
import { ObiColors } from '../../constants/ElementColors';
import { ArrowLine } from '../../components/ArrowLine';

const containerCSS = css`
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  background-color: white;
  border-radius: 2px 2px 0 0;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

const fullWidthSection = css`
  width: 100%;
  box-sizing: border-box;
`;

export interface CardTemplateProps {
  header: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickHeader?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickBody?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickFooter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const CardTemplate: FC<CardTemplateProps> = ({
  header,
  body,
  footer,
  onClick,
  onClickHeader,
  onClickBody,
  onClickFooter,
}) => {
  const renderHeader = (header: ReactNode) => (
    <div
      className="CardNode__Header"
      css={css`
        ${fullWidthSection};
        height: ${HeaderHeight}px;
      `}
      onClick={onClickHeader}
    >
      {header}
    </div>
  );

  const renderBody = (body: ReactNode) => (
    <div
      className="CardNode__Body"
      css={css`
        ${fullWidthSection};
        min-height: ${StandardSectionHeight}px;
        padding: 7px 8px;
      `}
      onClick={onClickBody}
    >
      <TextDiv css={{ width: '100%' }}>{body}</TextDiv>
    </div>
  );

  const renderFooter = (footer: ReactNode) => (
    <div
      className="CardNode__Footer"
      css={css`
        ${fullWidthSection};
        min-height: ${StandardSectionHeight}px;
        padding: 8px 8px;
      `}
      onClick={onClickFooter}
    >
      <TextDiv css={{ width: '100%' }}>{footer}</TextDiv>
    </div>
  );

  const renderSeparateline = () => (
    <div
      className="Separator"
      css={css`
        display: block;
        height: 0px;
        overflow: visible;
      `}
    >
      <ArrowLine arrowsize={8} color={ObiColors.AzureGray3} width={StandardNodeWidth} />
    </div>
  );

  // If body is null but footer not null, show footer as body.
  const [displayedBody, displayedFooter] = [body, footer].filter((x) => x !== undefined && x !== null);
  const showFooter = displayedFooter !== undefined;
  return (
    <div
      className="CardNode"
      css={css`
        ${containerCSS};
        width: ${StandardNodeWidth}px;
        min-height: ${HeaderHeight}px;
      `}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick(e);
            }
          : undefined
      }
    >
      {renderHeader(header)}
      {renderBody(displayedBody)}
      {showFooter ? renderSeparateline() : null}
      {showFooter ? renderFooter(footer) : null}
    </div>
  );
};
