// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { NodeEventTypes } from './NodeEventTypes';

export type NodeEventhandler = (nodeId: string, eventName: NodeEventTypes, eventData?: any) => any;
