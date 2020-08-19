import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { ISeparatorStyles, Separator } from 'office-ui-fabric-react/lib/Separator';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

interface ICollapsibleHeaderProps {
  headerText: string;
  content: React.ReactNode;
}

interface ICollapsibleHeaderState {
  isOpen: boolean;
}

export class CollapsibleHeader extends React.Component<ICollapsibleHeaderProps, ICollapsibleHeaderState> {
  constructor(props: ICollapsibleHeaderProps) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    const separatorStyles: Partial<ISeparatorStyles> = {
      root: { color: 'black' },
    };

    const iconClass = mergeStyles({
      marginRight: '25px',
    });
    return (
      <div>
        <div
          style={{ cursor: 'pointer' }}
          onClick={(event: any) => {
            this.setState({ isOpen: !this.state.isOpen });
          }}
        >
          <FontIcon iconName="ChevronDown" className={iconClass} />
          <Text variant="xLarge">{this.props.headerText}</Text>
          <Separator styles={separatorStyles} />
        </div>
        {this.state.isOpen && this.props.content}
      </div>
    );
  }
}
