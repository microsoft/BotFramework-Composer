import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const navLinkClass = mergeStyleSets({
  storageNav: {
    color: 'black',
    fontSize: '16px',
    width: '200px',
    selectors: {
      '&:after': {
        border: '0px !important',
      },
    },
  },
  linkText: {
    zIndex: '1111',
  },
});
