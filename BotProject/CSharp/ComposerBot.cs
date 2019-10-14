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
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.Recognizers.Text;
using Newtonsoft.Json;


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
        private Source.IRegistry registry;
        private string rootDialogFile { get; set; }

        public ComposerBot(string rootDialogFile, ConversationState conversationState, UserState userState, ResourceExplorer resourceExplorer, Source.IRegistry registry)
        {
            this.conversationState = conversationState;
            this.userState = userState;
            this.dialogState = conversationState.CreateProperty<DialogState>("DialogState");
            this.registry = registry;
            this.resourceExplorer = resourceExplorer;
            this.rootDialogFile = rootDialogFile;
            // auto reload dialogs when file changes
            this.resourceExplorer.Changed += (resources) =>
            {
                if (resources.Any(resource => resource.Id == ".dialog"))
                {
                    Task.Run(() => this.LoadRootDialogAsync());
                }
            };

            LoadRootDialogAsync();
        }

        private void LoadRootDialogAsync()
        {
            var rootFile = resourceExplorer.GetResource(rootDialogFile);
            rootDialog = DeclarativeTypeLoader.Load<AdaptiveDialog>(rootFile, resourceExplorer, registry);
            this.dialogManager = new DialogManager(rootDialog);
        }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            await this.dialogManager.OnTurnAsync(turnContext, cancellationToken: cancellationToken);
            await this.conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await this.userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }
    }
}
