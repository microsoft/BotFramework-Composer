﻿// Copyright (c) Microsoft Corporation. All rights reserved.
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
    public class TestBot : IBot
    {
        private DialogSet _dialogs;
        private IDialog rootDialog;
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
            this.resourceExplorer.Changed += ResourceExplorer_Changed;

            LoadRootDialogAsync();
        }

        private void ResourceExplorer_Changed(string[] paths)
        {
            if (paths.Any(p => Path.GetExtension(p) == ".dialog"))
            {
                Task.Run(() => this.LoadRootDialogAsync());
            }
        }

        private void LoadRootDialogAsync()
        {
            var rootFile = resourceExplorer.GetResource(rootDialogFile);
            rootDialog = DeclarativeTypeLoader.Load<IDialog>(rootFile, resourceExplorer, registry);
            _dialogs = new DialogSet(this.dialogState);
            _dialogs.Add(rootDialog);
        }

        public async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (rootDialog is AdaptiveDialog adaptiveDialog)
            {
                await adaptiveDialog.OnTurnAsync(turnContext, null, cancellationToken).ConfigureAwait(false);
            }
            else
            {
                if (turnContext.Activity.Type == ActivityTypes.Message && turnContext.Activity.Text == "throw")
                {
                    throw new Exception("oh dear");
                }

                if (turnContext.Activity.Type == ActivityTypes.Message)
                {
                    // run the DialogSet - let the framework identify the current state of the dialog from 
                    // the dialog stack and figure out what (if any) is the active dialog
                    var dialogContext = await _dialogs.CreateContextAsync(turnContext, cancellationToken);
                    var results = await dialogContext.ContinueDialogAsync(cancellationToken);

                    if (results.Status == DialogTurnStatus.Empty || results.Status == DialogTurnStatus.Complete)
                    {
                        await dialogContext.BeginDialogAsync(rootDialog.Id, null, cancellationToken);
                    }
                }
            }
        }
    }
}
