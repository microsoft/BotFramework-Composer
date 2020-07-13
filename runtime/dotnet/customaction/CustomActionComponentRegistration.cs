using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Microsoft.BotFramework.Composer.CustomAction
{
    public class CustomActionComponentRegistration : ComponentRegistration, IComponentDeclarativeTypes
    {
        public IEnumerable<DeclarativeType> GetDeclarativeTypes(ResourceExplorer resourceExplorer)
        {
            // Actions
            //yield return new DeclarativeType<MultiplyDialog>(MultiplyDialog.Kind);
            yield return new DeclarativeType<CallAzureFunction>(CallAzureFunction.Kind);
            yield return new DeclarativeType<ConnectToChitChatKB>(ConnectToChitChatKB.Kind);
            yield return new DeclarativeType<EndCall>(EndCall.Kind);
            yield return new DeclarativeType<SetSpeechEndpoint>(SetSpeechEndpoint.Kind);
            yield return new DeclarativeType<SetTTSCaching>(SetTTSCaching.Kind);
            yield return new DeclarativeType<TransferCall>(TransferCall.Kind);
        }

        public IEnumerable<JsonConverter> GetConverters(ResourceExplorer resourceExplorer, SourceContext sourceContext)
        {
            yield break;
        }
    }
}
