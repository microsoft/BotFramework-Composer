### Description

OBI Transfromer is a pure function lib for generating directed graph schema from native OBI json.

Typically, the transformation from 'OBI schema' to 'directed graph schema' (consists of nodes and edges) can be described as three stages:
1. Select
2. Connect
3. Transform

`Select` consists a series of operations to select specific parts from the original data. [JsonPath](https://github.com/json-path/JsonPath) has been proved a reliable library to complete this kind of work. We also use a JsonPath-styled format to trace where a data piece came from.

`Connect` is the stage where we define connections between data and data (nodes to nodes). Based on the selection result produced by a `selector`, a `connector` will generate edges based on some user-defined policies.

`Tranform` is the stage where selected data segments are mapped to the required format (usually a graph node object) based on the output of `Select` stage.

### Examples

1. Run the command-line example:

    `ts-node demo/src/runTsExample.ts`

2. Run the visualization demo:

    `npm start` or `yarn start`
