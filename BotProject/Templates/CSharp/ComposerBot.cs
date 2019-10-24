// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.LanguageGeneration;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.Recognizers.Text;
using Newtonsoft.Json;
using Microsoft.Bot.Builder.AI.QnA;


namespace Microsoft.Bot.Builder.ComposerBot.json
{
    public class ComposerBot : ActivityHandler
    {
        private AdaptiveDialog rootDialog;
        private readonly ResourceExplorer resourceExplorer;
        private UserState userState;
        private DialogManager dialogManager;
        private ConversationState conversationState;
        private IStatePropertyAccessor<DialogState> dialogState;
        private ISourceMap sourceMap;
        private string rootDialogFile { get; set; }
        private IBotTelemetryClient telemetryClient;

        public ComposerBot(string rootDialogFile, ConversationState conversationState, UserState userState, ResourceExplorer resourceExplorer, ISourceMap sourceMap, IBotTelemetryClient telemetryClient)
        {
            this.conversationState = conversationState;
            this.userState = userState;
            this.dialogState = conversationState.CreateProperty<DialogState>("DialogState");
            this.sourceMap = sourceMap;
            this.resourceExplorer = resourceExplorer;
            this.rootDialogFile = rootDialogFile;
            this.telemetryClient = telemetryClient;
            DeclarativeTypeLoader.AddComponent(new QnAMakerComponentRegistration());

            LoadRootDialogAsync();
        }

        private void LoadRootDialogAsync()
        {
            var rootFile = resourceExplorer.GetResource(rootDialogFile);
            rootDialog = DeclarativeTypeLoader.Load<AdaptiveDialog>(rootFile, resourceExplorer, sourceMap);
            this.dialogManager = new DialogManager(rootDialog);
        }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            this.telemetryClient.TrackTrace("Activity:" + turnContext.Activity.Text, Severity.Information, null);
            await this.dialogManager.OnTurnAsync(turnContext, cancellationToken: cancellationToken);
            await this.conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await this.userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }
    }
}
