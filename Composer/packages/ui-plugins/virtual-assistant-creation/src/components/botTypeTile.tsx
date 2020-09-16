import React from 'react';
import { mergeStyles } from '@uifabric/merge-styles';

interface IColorFormProps {
  botName: string;
  botDescription: string;
}

export const BotTypeTile: React.StatelessComponent<IColorFormProps> = (props: IColorFormProps) => {
  const descriptionFieldClassName = mergeStyles({
    display: 'inline-block',
    height: '59px',
    width: '50%',
    paddingLeft: '30px',
  });

  return (
    // <p>{props.botName}</p>
    <div className={descriptionFieldClassName}>{props.botDescription}</div>
  );
};
