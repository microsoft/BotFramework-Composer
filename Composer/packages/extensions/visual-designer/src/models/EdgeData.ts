// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export interface Coord2D {
  x: number;
  y: number;
}

export enum EdgeDirection {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}

export interface EdgeOptions {
  color?: string;

  /** Indicates if the line stroke is dashed */
  dashed?: boolean;

  /** If set to true, an arrow will be drawn at the end of the line */
  arrowed?: boolean;

  /** Text displayed on the edge */
  label?: string | number;

  /** label text's offset compared with start point's position */
  labelOptions?: {
    offset: {
      x: number;
      y: number;
    };
    fontSize: number;
  };
}

export class EdgeData {
  id = '';
  direction: 'x' | 'y' = 'x';
  x = 0;
  y = 0;
  length = 0;
  text?: string = '';
  dashed?: boolean = false;
  directed?: boolean = false;
  invertDirected?: boolean = false;
}
