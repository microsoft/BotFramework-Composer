// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.BotFramework.Composer.CustomAction.Action;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Microsoft.BotFramework.Composer.CustomAction
{
    public class CustomActionComponentRegistration : ComponentRegistration, IComponentDeclarativeTypes
    {
        public IEnumerable<DeclarativeType> GetDeclarativeTypes(ResourceExplorer resourceExplorer)
        {
            // Actions
            yield return new DeclarativeType<WatchDialog>(WatchDialog.Kind);
            yield return new DeclarativeType<HumanDialog>(HumanDialog.Kind);
            yield return new DeclarativeType<UnwatchDialog>(UnwatchDialog.Kind);
            yield return new DeclarativeType<AcceptOrRejectDialog>(AcceptOrRejectDialog.Kind);
            yield return new DeclarativeType<PostDialog>(PostDialog.Kind);
            yield return new DeclarativeType<GetRequestsDialog>(GetRequestsDialog.Kind);
            yield return new DeclarativeType<DisconnectDialog>(DisconnectDialog.Kind);
        }

        public IEnumerable<JsonConverter> GetConverters(ResourceExplorer resourceExplorer, SourceContext sourceContext)
        {
            yield break;
        }
    }
}