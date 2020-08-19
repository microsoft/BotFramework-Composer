import { Icon } from '@fluentui/react/lib/Icon';
import { DefaultButton, IStackTokens, mergeStyles, PrimaryButton, Stack } from 'office-ui-fabric-react';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';
import { Link } from 'react-router-dom';

interface IModalShellProps {
  title: string;
  nextPath?: string;
  previousPath?: string;
  subTitle?: string;
}

export const ModalShell: React.FunctionComponent<React.PropsWithChildren<IModalShellProps>> = (
  props: React.PropsWithChildren<IModalShellProps>
) => {
  const stackTokens: IStackTokens = { childrenGap: 20 };

  const headerClassName = mergeStyles({
    minHeight: '3vh',
  });

  const containerClassName = mergeStyles({
    padding: '30px',
    borderTop: '4px solid #0078d4',
    minWidth: '50vw',
    minHeight: '50vh',
  });

  const iconClassName = mergeStyles({
    marginRight: '20px',
    float: 'right',
  });

  const subTitleClassName = mergeStyles({
    marginTop: '5px',
    marginRight: '4px',
    color: '#605E5C',
  });

  const footerClassName = mergeStyles({
    minHeight: '5vh',
    float: 'right',
    paddingRight: '15px',
  });

  const contentClassName = mergeStyles({
    minHeight: '40vh',
    paddingTop: '15px',
    overflowY: 'auto',
    paddingBottom: '25px',
  });

  return (
    <div className={containerClassName}>
      <div className="ms-Grid" dir="ltr">
        <div className={'ms-Grid-row ' + headerClassName}>
          <Text variant="xLarge">{props.title}</Text>
          <Icon iconName="Cancel" className={iconClassName} />
        </div>
        <div className="ms-Grid-row">
          <Text variant="medium" className={subTitleClassName}>
            {props.subTitle}
          </Text>
        </div>
        <div className={'ms-Grid-row ' + contentClassName}>{props.children}</div>
        <div className={footerClassName}>
          <Stack horizontal tokens={stackTokens}>
            {props.previousPath ? (
              <Link to={props.previousPath}>
                <DefaultButton text="Back" />{' '}
              </Link>
            ) : null}
            {props.nextPath ? (
              <Link to={props.nextPath}>
                <PrimaryButton text="Next" />{' '}
              </Link>
            ) : null}
          </Stack>
        </div>
      </div>
    </div>
  );
};
