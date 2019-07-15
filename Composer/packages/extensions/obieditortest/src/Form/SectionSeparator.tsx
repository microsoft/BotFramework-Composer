import React from 'react';
import { Separator, createTheme, FontSizes, FontWeights, ISeparatorProps } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: FontSizes.large,
      fontWeight: FontWeights.semibold,
    },
  },
  palette: {
    neutralLighter: NeutralColors.gray120,
  },
});

export default function SectionSeparator(props: ISeparatorProps) {
  return (
    <Separator
      theme={fieldHeaderTheme}
      alignContent="start"
      styles={{ root: { marginTop: '30px' }, content: { paddingLeft: '0', paddingRight: '32px' } }}
      {...props}
    >
      {props.children}
    </Separator>
  );
}
