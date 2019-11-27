// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.AI.QnA;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class ComposerBot : ActivityHandler
    {
        private AdaptiveDialog rootDialog;
        private readonly ResourceExplorer resourceExplorer;
        private readonly UserState userState;
        private DialogManager dialogManager;
        private readonly ConversationState conversationState;
        private readonly IStatePropertyAccessor<DialogState> dialogState;
        private readonly ISourceMap sourceMap;

        public ComposerBot(string rootDialogFile, ConversationState conversationState, UserState userState, ResourceExplorer resourceExplorer, ISourceMap sourceMap)
        {
            this.conversationState = conversationState;
            this.userState = userState;
            this.dialogState = conversationState.CreateProperty<DialogState>("DialogState");
            this.sourceMap = sourceMap;
            this.resourceExplorer = resourceExplorer;
            this.RootDialogFile = rootDialogFile;
            DeclarativeTypeLoader.AddComponent(new QnAMakerComponentRegistration());

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

        private string RootDialogFile { get; set; }

        public override async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            await this.dialogManager.OnTurnAsync(turnContext, cancellationToken: cancellationToken);
            await this.conversationState.SaveChangesAsync(turnContext, false, cancellationToken);
            await this.userState.SaveChangesAsync(turnContext, false, cancellationToken);
        }

        private void LoadRootDialogAsync()
        {
            var rootFile = resourceExplorer.GetResource(RootDialogFile);
            rootDialog = DeclarativeTypeLoader.Load<AdaptiveDialog>(rootFile, resourceExplorer, sourceMap);
            this.dialogManager = new DialogManager(rootDialog);
        }
    }
}