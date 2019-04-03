import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const breadcrumbClass = mergeStyleSets({
  root: {
    marginTop: '5px',
    marginLeft: '10px',
  },
  listItem: {
    alignItems: 'baseline',
  },
  itemLink: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#4f4f4f',
    paddingRight: '4px',
    paddingLeft: '4px',
  },
  chevron: {
    fontSize: '8px',
    fontWeight: 'bold',
  },
});
