import React, { useState, useRef, useLayoutEffect } from 'react';
import { Separator, createTheme, FontSizes, FontWeights, ISeparatorProps, IconButton } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { assign } from 'lodash';

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

const defaultStyles: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };

interface SectionSeparatorProps extends ISeparatorProps {
  collapsable?: boolean;
  label: React.ReactNode | false;
  styles?: React.CSSProperties;
}

export default function SectionSeparator(props: SectionSeparatorProps) {
  const { styles: styleOverrides, collapsable, label, ...rest } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      const newHeight = contentRef.current.offsetHeight;

      if (newHeight !== contentHeight) {
        setContentHeight(newHeight);
      }
    }
  });

  return (
    <>
      <div style={assign({}, defaultStyles, styleOverrides)}>
        <Separator
          theme={fieldHeaderTheme}
          alignContent="start"
          styles={{ root: { flex: 1 }, content: { paddingLeft: '0', paddingRight: '16px' } }}
          {...rest}
        >
          {label}
        </Separator>
        {collapsable && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            iconProps={{ iconName: 'PageRight' }}
            checked={collapsed}
            styles={{
              rootChecked: { backgroundColor: 'transparent' },
              iconChecked: { transform: 'rotate(270deg)' },
              icon: { color: 'black', transform: 'rotate(90deg)', transition: 'transform 0.2s linear' },
            }}
          />
        )}
      </div>
      {props.children && (
        <div>
          <div
            style={{
              // need to buffer the height to account for adding new elements
              maxHeight: collapsed ? '0px' : contentHeight ? `${contentHeight + 100}px` : '100%',
              opacity: collapsed ? 0 : 1,
              transition: contentHeight
                ? 'max-height 0.25s ease-in, opacity 0.25s ease-in'
                : 'max-height 0.25s ease-out, opacity 0.25s ease-out',
              overflowY: 'hidden',
            }}
          >
            <div ref={contentRef} style={{ overflow: 'auto' }}>
              {props.children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
