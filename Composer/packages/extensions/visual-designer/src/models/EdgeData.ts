// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

  /** If set to true, an arrowhead will be drawn at the end of the line */
  directed?: boolean;

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

export interface Edge {
  id: string;
  x: number;
  y: number;
  direction: EdgeDirection;
  length: number;
  options?: EdgeOptions;
}
