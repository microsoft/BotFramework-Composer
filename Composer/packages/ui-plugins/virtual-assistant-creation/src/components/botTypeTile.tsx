import React from 'react';
import { mergeStyles } from '@uifabric/merge-styles';

interface IColorFormProps {
  botName: string;
  botDescription: string;
}

export const BotTypeTile: React.StatelessComponent<IColorFormProps> = (props: IColorFormProps) => {
  const containerClassName = mergeStyles({
    display: 'inline-block',
    height: '59px',
    width: '50%',
    borderBottom: '1px solid #EDEBE9',
    selectors: {
      ':hover': {
        backgroundColor: '#EDEBE9',
      },
    },
  });

  const nameFieldClassName = mergeStyles({
    display: 'inline-block',
    height: '59px',
    width: '20%',
    paddingLeft: '20px',
    fontWeight: '500',
    selectors: {
      ':hover': {
        backgroundColor: '#EDEBE9',
      },
    },
  });

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
