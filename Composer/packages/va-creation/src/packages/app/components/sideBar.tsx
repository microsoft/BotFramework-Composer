import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { IAppState, ISideBarEntry } from '../../../models/reduxState';
import { actionTypes, genericSingleAction } from '../../shared/actions';
import { SideNavStyling } from '../styles';
import { NavItem } from './navItem';

interface StateProps {
  activePath: string;
  sideBarEntries: ISideBarEntry[];
}

interface DispatchProps {
  setActivePath: (activePath: string) => void;
}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

class SideNav extends React.Component<PropsType, any> {
  constructor(props: any) {
    super(props);
  }

  onItemClick = (path: string) => {
    this.props.setActivePath(path);
  };

  render() {
    return (
      <SideNavStyling>
        {
          /* items = just array AND map() loops thru that array AND item is param of that loop */
          this.props.sideBarEntries.map((item: ISideBarEntry) => {
            /* Return however many NavItems in array to be rendered */
            return (
              <NavItem
                path={item.path}
                name={item.name}
                iconName={item.iconName}
                onItemClick={() => this.onItemClick(item.path)}
                active={item.path === this.props.activePath}
                key={item.key}
              />
            );
          })
        }
      </SideNavStyling>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({
  activePath: state.NavState.activePath,
  sideBarEntries: state.NavState.sideBarEntries,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({
  setActivePath: (activePath: string) => {
    dispatch(genericSingleAction<string>(actionTypes.SET_ACTIVE_PATH, activePath));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SideNav);
