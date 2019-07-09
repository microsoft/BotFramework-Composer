import { FontWeights } from '@uifabric/styling';

export const textFieldlabel = {
  label: {
    root: [
      {
        fontWeight: FontWeights.semibold,
      },
    ],
  },
};

export const name = {
  fieldGroup: {
    width: 200,
  },
  root: {
    height: '90px',
  },
  subComponentStyles: textFieldlabel,
};

export const description = {
  subComponentStyles: textFieldlabel,
};
