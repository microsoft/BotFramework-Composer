import styled from '@emotion/styled';

export const SideNavStyling = styled.div`
  position: fixed; /* Fixed Sidebar (stay in place on scroll and position relative to viewport) */
  height: 100%;
  width: 5%; /* Set the width of the sidebar */
  z-index: 1; /* Stay on top of everything */
  top: 3.4em; /* Stay at the top */
  background-color: #0078d4;
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 10px;
`;

export const NavItemStyling = styled.div`
  height: 70px;
  width: 75px; /* width must be same size as NavBar to center */
  text-align: center; /* Aligns <a> inside of NavIconStyling div */
  margin-bottom: 0; /* Puts space between NavItems */
  a {
    font-size: 2.7em;
    color: ${(props: any) => (props.active ? 'black' : '#137AD1')};
    :hover {
      opacity: 0.7;
      text-decoration: none; /* Gets rid of underlining of icons */
    }
  }
`;

export const NavBarStyling = styled.div`
  .navbar {
    background-color: #0078d4;
  }
  a,
  .navbar-nav,
  .navbar-light .nav-link {
    color: white;
    &:hover {
      color: white;
    }
  }
  .navbar-brand {
    font-size: 1.4em;
    color: white;
    &:hover {
      color: white;
    }
  }
  .form-center {
    position: absolute !important;
    left: 25%;
    right: 25%;
  }
`;
