// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import get from 'lodash/get';
import { LinkBtn } from '@bfc/ui-shared';
import { useContext } from 'react';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { RendererContext } from '../contexts/RendererContext';
import { ElementWrapperTag } from '../types/PluggableComponents.types';
export var DialogRef = function (_a) {
    var id = _a.id, onEvent = _a.onEvent, dialog = _a.dialog, getRefContent = _a.getRefContent;
    var ElementWrapper = useContext(RendererContext).ElementWrapper;
    var calleeDialog = typeof dialog === 'object' ? get(dialog, '$ref') : dialog;
    var dialogRef = calleeDialog ? (jsx(ElementWrapper, { nodeId: id, tagId: ElementWrapperTag.Link },
        jsx(LinkBtn, { onClick: function (e) {
                e.stopPropagation();
                onEvent(NodeEventTypes.OpenDialog, { caller: id, callee: calleeDialog });
            } }, calleeDialog))) : null;
    return typeof getRefContent === 'function' ? getRefContent(dialogRef) : dialogRef;
};
//# sourceMappingURL=DialogRef.js.map