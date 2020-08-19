import * as React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { NavBarStyling } from '../styles';

interface SideBarProps {}
export class NavigationBar extends React.Component<SideBarProps, any> {
  constructor(props: SideBarProps) {
    super(props);
  }

  public render() {
    return (
      <NavBarStyling>
        <Navbar expand="lg">
          <Navbar.Brand href="/">Virtual Assistant Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <Nav.Item>
                <Nav.Link href="/">Home</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="/about">About</Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </NavBarStyling>
    );
  }
}
