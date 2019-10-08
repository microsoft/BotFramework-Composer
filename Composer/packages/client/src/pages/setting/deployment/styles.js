import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';

export const styles = {
  page: {
    padding: '1rem',
  },
  header: {
    marginTop: '0',
  },
  halfstack: {
    root: [
      {
        flexBasis: '50%',
      },
    ],
  },
  stackinput: {
    root: [
      {
        marginBottom: '1rem',
      },
    ],
  },
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '80% !important',
      width: '960px !important',
    },
  },
  input: {
    subComponentStyles: {
      label: {
        root: [
          {
            fontWeight: FontWeights.semibold,
          },
        ],
      },
    },
  },
};
