﻿// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Declarative;
using Microsoft.Bot.Builder.Dialogs.Rules;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    public class TestBot : IBot
    {
        private DialogSet _dialogs;
        private SemaphoreSlim _semaphore;

        private readonly IDialog rootDialog;
        public TestBot(TestBotAccessors accessors)
        {
            // create the DialogSet from accessor
            rootDialog = DeclarativeTypeLoader.Load<IDialog>(File.ReadAllText(accessors.RootDialogFile));
            //rootDialog = CognitiveLoader.Load<IDialog>(File.ReadAllText(@"Samples\Planning 6 - DoSteps\main.dialog"));
            _dialogs = new DialogSet(accessors.ConversationDialogState);
            _dialogs.Add(rootDialog);
        }

        public async Task OnTurnAsync(ITurnContext turnContext, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (rootDialog is RuleDialog planningDialog)
            {
                await planningDialog.OnTurnAsync(turnContext, null, cancellationToken).ConfigureAwait(false);
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
