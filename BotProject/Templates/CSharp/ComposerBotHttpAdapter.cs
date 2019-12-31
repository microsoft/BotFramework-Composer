using System;
using Microsoft.ApplicationInsights;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.AI.QnA;
using Microsoft.Bot.Builder.Azure;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.Integration.AspNet.Core.Skills;
using Microsoft.Bot.Builder.LanguageGeneration;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class ComposerBotHttpAdapter : BotFrameworkHttpAdapter
    {
        public ComposerBotHttpAdapter(
            ICredentialProvider credentialProvider,
            IConfiguration configuration,
            IStorage storage,
            UserState userState,
            ConversationState conversationState,
            InspectionState inspectionState,
            ResourceExplorer resourceExplorer,
            BotSettings settings,
            TelemetryClient telemetryClient,
            SkillHttpClient skillHttpClient)
            : base(configuration, credentialProvider)
        {
            var registrations = new TypeRegistration[]
            {
                new TypeRegistration<BeginSkill>("Microsoft.BeginSkill") { CustomDeserializer = new BeginSkillLoader(skillHttpClient, conversationState) }
            };
            this
              .UseStorage(storage)
              .UseState(userState, conversationState)
              .UseAdaptiveDialogs()
              .UseResourceExplorer(resourceExplorer, registrations)
              .UseLanguageGeneration(resourceExplorer, "common.lg")
              .Use(new RegisterClassMiddleware<IConfiguration>(configuration))
              .Use(new InspectionMiddleware(inspectionState, userState, conversationState, new MicrosoftAppCredentials(settings.MicrosoftAppId, settings.MicrosoftAppPassword)));

            if (!string.IsNullOrEmpty(settings.BlobStorage.ConnectionString) && !string.IsNullOrEmpty(settings.BlobStorage.Container))
            {
                this.Use(new TranscriptLoggerMiddleware(new AzureBlobTranscriptStore(settings.BlobStorage.ConnectionString, settings.BlobStorage.Container)));
            }
            else
            {
                Console.WriteLine("The settings of TranscriptLoggerMiddleware is incomplete, please check following settings: settings.BlobStorage.ConnectionString, settings.BlobStorage.Container");
            }

            this.OnTurnError = async (turnContext, exception) =>
            {
                await turnContext.SendActivityAsync(exception.Message).ConfigureAwait(false);
                telemetryClient.TrackException(new Exception("Exceptions: " + exception.Message));
                await conversationState.ClearStateAsync(turnContext).ConfigureAwait(false);
                await conversationState.SaveChangesAsync(turnContext).ConfigureAwait(false);
            };
        }
    }
}
