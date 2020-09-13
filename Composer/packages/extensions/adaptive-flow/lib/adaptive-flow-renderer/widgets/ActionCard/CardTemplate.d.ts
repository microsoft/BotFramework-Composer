import { FC, ReactNode } from 'react';
export interface CardTemplateProps {
  header: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickHeader?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickBody?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onClickFooter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
export declare const CardTemplate: FC<CardTemplateProps>;
//# sourceMappingURL=CardTemplate.d.ts.map
