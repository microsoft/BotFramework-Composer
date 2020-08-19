import { Icon } from '@fluentui/react/lib/Icon';
import { mergeStyles } from '@uifabric/merge-styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavItemStyling } from '../styles';

export class NavItem extends React.Component<any, any> {
  handleClick = () => {
    const { path, onItemClick } = this.props;
    onItemClick(path);
  };

  render() {
    const { active } = this.props;
    var classname = mergeStyles({ color: 'white' });
    return (
      <NavItemStyling active={active}>
        <Link to={this.props.path} onClick={this.handleClick}>
          <Icon iconName={this.props.iconName} className={'ms-IconExample ' + classname} />
        </Link>
      </NavItemStyling>
    );
  }
}
