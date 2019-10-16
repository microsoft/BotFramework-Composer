import { IModalStyleProps, IModalStyles, IStyleFunctionOrObject } from 'office-ui-fabric-react';

const primaryColor = '#50e6ff';

export const collapsedStyles: IStyleFunctionOrObject<IModalStyleProps, IModalStyles> = {
  main: {
    backgroundColor: primaryColor,
    bottom: '30px',
    color: 'white',
    paddingLeft: '15px',
    position: 'absolute',
    right: '20px',
  },
};

export const expandedStyles: IStyleFunctionOrObject<IModalStyleProps, IModalStyles> = {
  main: {
    bottom: '30px',
    padding: '15px',
    position: 'absolute',
    right: '30px',
  },
};
