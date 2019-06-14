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


namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class TestBot : ActivityHandler
    {
        private AdaptiveDialog rootDialog;
        private readonly ResourceExplorer resourceExplorer;
        private UserState userState;
        private ConversationState conversationState;
        private IStatePropertyAccessor<DialogState> dialogState;
        private Source.IRegistry registry;
        private string rootDialogFile { get; set; }

        public TestBot(string rootDialogFile, ConversationState conversationState, ResourceExplorer resourceExplorer, Source.IRegistry registry)
        {
            dialogState = conversationState.CreateProperty<DialogState>("DialogState");
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
        }

        protected override Task OnMembersAddedAsync(IList<ChannelAccount> membersAdded, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            return rootDialog.OnTurnAsync((ITurnContext)turnContext, null, cancellationToken);
        }

        protected async override Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            await rootDialog.OnTurnAsync(turnContext, null, cancellationToken).ConfigureAwait(false);
        }
    }
}
