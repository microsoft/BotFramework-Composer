import React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { SwatchColorPicker, ISwatchColorPickerStyles } from 'office-ui-fabric-react/lib/SwatchColorPicker';

interface IColorFormProps {
  updateStyleElement: (styleElementName: string, value: any) => void;
}

export const ColorForm: React.StatelessComponent<IColorFormProps> = (props: IColorFormProps) => {
  const accentColorOptions = [
    { id: '1', label: 'blue', color: '#0063B1' },
    { id: '2', label: 'cyan', color: '#038387' },
    { id: '3', label: 'blueMagenta', color: '#8764b8' },
    { id: '4', label: 'magenta', color: '#881798' },
    { id: '5', label: 'white', color: '#ffffff' },
  ];

  const chatBackgroundColorOptions = [
    { id: '1', label: 'white', color: '#ffffff' },
    { id: '2', label: 'lightGrey', color: '#d1d1d1' },
    { id: '3', label: 'midGrey', color: '#b8b8b8' },
    { id: '4', label: 'darkGrey', color: '#7d7d7d' },
    { id: '5', label: 'black', color: '#000000' },
  ];

  const chatBubbleBackgroundColorOptions = [
    { id: '1', label: 'white', color: '#ffffff' },
    { id: '2', label: 'lightGrey', color: '#d1d1d1' },
    { id: '3', label: 'midGrey', color: '#b8b8b8' },
    { id: '4', label: 'darkGrey', color: '#7d7d7d' },
    { id: '5', label: 'black', color: 'Black' },
  ];
  return (
    <div>
      <div>
        <Label>Web Chat Accent Color</Label>
        <SwatchColorPicker
          columnCount={5}
          cellShape={'square'}
          colorCells={accentColorOptions}
          onColorChanged={(id?, color?) => {
            props.updateStyleElement('accent', color);
          }}
        />
      </div>
      <div>
        <Label>Web Chat Background Color</Label>
        <SwatchColorPicker
          columnCount={5}
          cellShape={'square'}
          colorCells={chatBackgroundColorOptions}
          onColorChanged={(id?, color?) => {
            props.updateStyleElement('backgroundColor', color);
          }}
        />
      </div>
      <div>
        <Label>Bot Chat Bubble Background Color</Label>
        <SwatchColorPicker
          columnCount={5}
          cellShape={'square'}
          colorCells={chatBubbleBackgroundColorOptions}
          onColorChanged={(id?, color?) => {
            props.updateStyleElement('bubbleBackground', color);
          }}
        />
      </div>
      <div>
        <Label>User Chat Bubble Background Color</Label>
        <SwatchColorPicker
          columnCount={5}
          cellShape={'square'}
          colorCells={chatBubbleBackgroundColorOptions}
          onColorChanged={(id?, color?) => {
            props.updateStyleElement('bubbleFromUserBackground', color);
          }}
        />
      </div>
    </div>
  );
};
