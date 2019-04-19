import React from 'react';

export class GraphObjectModel {
  ref = React.createRef();
  boundary = {
    width: 0,
    height: 0,
  };
  offset = { x: 0, y: 0 };
  props;
}
