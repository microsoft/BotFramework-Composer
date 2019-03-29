﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Declarative.Debugger;
using Microsoft.Bot.Builder.Dialogs.Rules;
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

        private TestBotAccessors accessors;

        private Source.IRegistry registry;


        public TestBot(TestBotAccessors accessors, ResourceExplorer resourceExplorer, Source.IRegistry registry)
        {
            this.registry = registry;
            this.accessors = accessors;
            this.resourceExplorer = resourceExplorer;
            this.resourceExplorer.Changed += ResourceExplorer_Changed;
            //this.resourceExplorer.Deleted += ResourceExplorer_Changed;

            LoadRootDialog();
        }

        private void ResourceExplorer_Changed(object sender, FileSystemEventArgs e)
        {
            if (Path.GetExtension(e.FullPath) == ".dialog")
            {
                LoadRootDialog();
            }
        }

        private void LoadRootDialog()
        {
            var rootFile = resourceExplorer.GetResource(accessors.RootDialogFile);
            rootDialog = DeclarativeTypeLoader.Load<IDialog>(rootFile.FullName, resourceExplorer, registry);
            _dialogs = new DialogSet(accessors.ConversationDialogState);
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
