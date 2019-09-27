/**
 * @module botbuilder-lg-LSP
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ReturnType } from 'botbuilder-expression';
export declare class FunctionEntity {
  constructor(params: string[], returntype: ReturnType, introduction: string);
  Params: string[];
  Returntype: ReturnType;
  Introduction: string;
}
export declare const buildInfunctionsMap: Map<string, FunctionEntity>;
