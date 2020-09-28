// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Conditions;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Generators;
using Microsoft.Bot.Builder.Dialogs.Declarative.Resources;
using Microsoft.Bot.Builder.Dialogs.Memory;
using Microsoft.Bot.Schema;
using Newtonsoft.Json.Linq;

namespace Microsoft.BotFramework.Composer.Core
{
    public class AdaptiveMiddlware : IMiddleware
    {
        private List<string> _triggers = new List<string>();
        private DialogSet _dialogs = new DialogSet();
        private ResourceExplorer _resourceExplorer;
        private ConversationState _conversationState;
        private UserState _userState;
        private string _dialogName;
        private string _defaultLocale;
        private string _dialogId;

        public AdaptiveMiddlware(string dialogName, string defaultLocale, ConversationState conversationState, UserState userState, ResourceExplorer resourceExplorer, IBotTelemetryClient telemetryClient = null)
        {
            _dialogName = dialogName.EndsWith(".dialog") ? dialogName : dialogName + ".dialog";
            _defaultLocale = defaultLocale;
            _conversationState = conversationState;
            _userState = userState;
            _resourceExplorer = resourceExplorer;

            // Load middleware dialog
            var dialogFile = _resourceExplorer.GetResource(_dialogName);
            var dialog = _resourceExplorer.LoadType<AdaptiveDialog>(dialogFile);
            dialog.AutoEndDialog = true;
            if (telemetryClient != null)
            {
                dialog.TelemetryClient = telemetryClient;
            }

            // Get list of triggers
            foreach (var trigger in dialog.Triggers)
            {
                if (trigger is OnDialogEvent t)
                {
                    _triggers.Add(t.Event);
                }
            }

            // Add to dialog set
            _dialogId = dialog.Id;
            _dialogs.Add(dialog);
        }

        public async Task OnTurnAsync(ITurnContext context, NextDelegate next, CancellationToken cancellationToken = default)
        {
            var start = DateTime.Now;

            var botStateSet = new BotStateSet();
            botStateSet.Add(_conversationState);
            if (_userState != null)
            {
                botStateSet.Add(_userState);
            }

            // Create DC
            var dc = await CreateDialogContextAsync(context, cancellationToken).ConfigureAwait(false);

            // Setup event handlers
            if (_triggers.Contains("OnSendActivities"))
            {
                context.OnSendActivities(async (ITurnContext ctx, List<Activity> activities, Func<Task<ResourceResponse[]>> nextSender) =>
                {
                    bool intercept = false;
                    var result = await SendEventAsync(dc, "OnSendActivities", activities, false, cancellationToken).ConfigureAwait(false);
                    if (result.Result is JArray list)
                    {
                        activities.Clear();
                        activities.AddRange(list.ToObject<IList<Activity>>());
                    }
                    else if (result.Result is JValue value)
                    {
                        intercept = value.ToObject<bool>();
                    }

                    return activities.Count > 0 && !intercept ? await nextSender().ConfigureAwait(false) : new ResourceResponse[] { };
                });
            }

            if (_triggers.Contains("OnUpdateActivity"))
            {
                context.OnUpdateActivity(async (ITurnContext ctx, Activity activity, Func<Task<ResourceResponse>> nextSender) =>
                {
                    var result = await SendEventAsync(dc, "OnUpdateActivity", activity, false, cancellationToken).ConfigureAwait(false);
                    var intercept = UpdateActivity(activity, result);
                    return !intercept ? await nextSender().ConfigureAwait(false) : new ResourceResponse();
                });
            }

            if (_triggers.Contains("OnDeleteActivity"))
            {
                context.OnDeleteActivity(async (ITurnContext ctx, ConversationReference reference, Func<Task> nextSender) =>
                {
                    var result = await SendEventAsync(dc, "OnDeleteActivity", reference, false, cancellationToken).ConfigureAwait(false);
                    if (!UpdateConversationReference(reference, result))
                    {
                        await nextSender().ConfigureAwait(false);
                    }
                });
            }

            // Are we in a multi-turn interruption
            bool intercepted = false;
            if (dc.ActiveDialog != null)
            {
                // Continue a previous turn
                var result = await dc.ContinueDialogAsync(cancellationToken);
                intercepted = UpdateActivity(context.Activity, result);
            }
            else if (_triggers.Contains("OnBeforeTurn") || !_triggers.Contains("beginDialog"))
            {
                // Call OnBeforeTurn
                var result = await SendEventAsync(dc, "OnBeforeTurn", context.Activity, true, cancellationToken).ConfigureAwait(false);
                intercepted = UpdateActivity(context.Activity, result);
            }

            var stop = DateTime.Now;
            Console.WriteLine($"Middleware Execution: {(stop - start).TotalMilliseconds}ms");

            // Save any BotState changes
            await botStateSet.SaveAllChangesAsync(dc.Context, false, cancellationToken).ConfigureAwait(false);

            // Continue middleware execution
            if (!intercepted)
            {
                //var dsm = context.TurnState.Get<DialogStateManager>();
                //context.TurnState.Remove(typeof(DialogStateManager).FullName);

                await next(cancellationToken).ConfigureAwait(false);

                //context.TurnState.Set(dsm);
            }

            // Call OnAfterTurn
            if (!intercepted && _triggers.Contains("OnAfterTurn"))
            {
                var result = await SendEventAsync(dc, "OnAfterTurn", context.Activity, true, cancellationToken).ConfigureAwait(false);
                intercepted = UpdateActivity(context.Activity, result);
            }

            // Save any BotState changes
            await botStateSet.SaveAllChangesAsync(dc.Context, false, cancellationToken).ConfigureAwait(false);
        }

        private bool UpdateActivity(Activity activity, DialogTurnResult result)
        {
            bool intercept = false;
            if (result.Status == DialogTurnStatus.Waiting)
            {
                intercept = true;
            }
            else if (result.Result is JObject jObj)
            {
                foreach (var pair in jObj)
                {
                    switch (pair.Key.ToLower())
                    {
                        case "attachmentlayout":
                            activity.AttachmentLayout = pair.Value?.ToObject<string>();
                            break;
                        case "attachments":
                            activity.Attachments = pair.Value?.ToObject<IList<Attachment>>();
                            break;
                        case "channeldata":
                            activity.ChannelData = pair.Value;
                            break;
                        case "channelid":
                            activity.ChannelId = pair.Value?.ToObject<string>();
                            break;
                        case "code":
                            activity.Code = pair.Value?.ToObject<string>();
                            break;
                        case "conversation":
                            activity.Conversation = pair.Value?.ToObject<ConversationAccount>();
                            break;
                        case "deliverymode":
                            activity.DeliveryMode = pair.Value?.ToObject<string>();
                            break;
                        case "entities":
                            activity.Entities = pair.Value?.ToObject<IList<Entity>>();
                            break;
                        case "expiration":
                            activity.Expiration = pair.Value?.ToObject<DateTimeOffset>();
                            break;
                        case "from":
                            activity.From = pair.Value?.ToObject<ChannelAccount>();
                            break;
                        case "historydisclosed":
                            activity.HistoryDisclosed = pair.Value?.ToObject<bool>();
                            break;
                        case "id":
                            activity.Id = pair.Value?.ToObject<string>();
                            break;
                        case "importance":
                            activity.Importance = pair.Value?.ToObject<string>();
                            break;
                        case "inputhint":
                            activity.InputHint = pair.Value?.ToObject<string>();
                            break;
                        case "label":
                            activity.Label = pair.Value?.ToObject<string>();
                            break;
                        case "listenfor":
                            activity.ListenFor = pair.Value?.ToObject<IList<string>>();
                            break;
                        case "locale":
                            activity.Locale = pair.Value?.ToObject<string>();
                            break;
                        case "localtimestamp":
                            activity.LocalTimestamp = pair.Value?.ToObject<DateTimeOffset>();
                            break;
                        case "localtimezone":
                            activity.LocalTimezone = pair.Value?.ToObject<string>();
                            break;
                        case "membersadded":
                            activity.MembersAdded = pair.Value?.ToObject<IList<ChannelAccount>>();
                            break;
                        case "membersremoved":
                            activity.MembersRemoved = pair.Value?.ToObject<IList<ChannelAccount>>();
                            break;
                        case "name":
                            activity.Name = pair.Value?.ToObject<string>();
                            break;
                        case "reactionsadded":
                            activity.ReactionsAdded = pair.Value?.ToObject<IList<MessageReaction>>();
                            break;
                        case "reactionsremoved":
                            activity.ReactionsRemoved = pair.Value?.ToObject<IList<MessageReaction>>();
                            break;
                        case "recipient":
                            activity.Recipient = pair.Value?.ToObject<ChannelAccount>();
                            break;
                        case "relatesto":
                            activity.RelatesTo = pair.Value?.ToObject<ConversationReference>();
                            break;
                        case "replytoid":
                            activity.ReplyToId = pair.Value?.ToObject<string>();
                            break;
                        case "semanticaction":
                            activity.SemanticAction = pair.Value?.ToObject<SemanticAction>();
                            break;
                        case "serviceurl":
                            activity.ServiceUrl = pair.Value?.ToObject<string>();
                            break;
                        case "speak":
                            activity.Speak = pair.Value?.ToObject<string>();
                            break;
                        case "suggestedactions":
                            activity.SuggestedActions = pair.Value?.ToObject<SuggestedActions>();
                            break;
                        case "summary":
                            activity.Summary = pair.Value?.ToObject<string>();
                            break;
                        case "text":
                            activity.Text = pair.Value?.ToObject<string>();
                            break;
                        case "textformat":
                            activity.TextFormat = pair.Value?.ToObject<string>();
                            break;
                        case "texthighlights":
                            activity.TextHighlights = pair.Value?.ToObject<IList<TextHighlight>>();
                            break;
                        case "timestamp":
                            activity.Timestamp = pair.Value?.ToObject<DateTimeOffset>();
                            break;
                        case "topicname":
                            activity.TopicName = pair.Value?.ToObject<string>();
                            break;
                        case "type":
                            activity.Type = pair.Value?.ToObject<string>();
                            break;
                        case "value":
                            activity.Value = pair.Value;
                            break;
                        case "valuetype":
                            activity.ValueType = pair.Value?.ToObject<string>();
                            break;
                        default:
                            activity.Properties[pair.Key] = pair.Value;
                            break;
                    }
                }
            }
            else if (result.Result is Boolean v)
            {
                intercept = v;
            }

            return intercept;
        }

        private bool UpdateConversationReference(ConversationReference reference, DialogTurnResult result)
        {
            bool intercept = false;
            if (result.Status == DialogTurnStatus.Waiting)
            {
                intercept = true;
            }
            else if (result.Result is JObject jObj)
            {
                foreach (var pair in jObj)
                {
                    switch (pair.Key.ToLower())
                    {
                        case "activityid":
                            reference.ActivityId = pair.Value?.ToObject<string>();
                            break;
                        case "bot":
                            reference.Bot = pair.Value?.ToObject<ChannelAccount>();
                            break;
                        case "channelid":
                            reference.ChannelId = pair.Value?.ToObject<string>();
                            break;
                        case "conversation":
                            reference.Conversation = pair.Value?.ToObject<ConversationAccount>();
                            break;
                        case "locale":
                            reference.Locale = pair.Value?.ToObject<string>();
                            break;
                        case "serviceurl":
                            reference.ServiceUrl = pair.Value?.ToObject<string>();
                            break;
                        case "user":
                            reference.User = pair.Value?.ToObject<ChannelAccount>();
                            break;
                    }
                }
            }
            else if (result.Result is Boolean v)
            {
                intercept = v;
            }

            return intercept;
        }

        private async Task<DialogTurnResult> SendEventAsync(DialogContext dc, string name, object value, bool canMultiturn, CancellationToken cancellationToken = default)
        {
            // Ensure activity is dispatched
            dc.Context.TurnState.Remove("activityReceivedEmitted");

            // Send event
            var evt = new DialogEvent()
            {
                Name = name,
                Value = value
            };
            var result = await dc.BeginDialogAsync(_dialogId, evt, cancellationToken).ConfigureAwait(false);
            if (result.Status == DialogTurnStatus.Waiting && !canMultiturn)
            {
                result = await dc.CancelAllDialogsAsync(cancellationToken).ConfigureAwait(false);
            }

            return result;
        }

        private async Task<DialogContext> CreateDialogContextAsync(ITurnContext context, CancellationToken cancellationToken = default)
        {
            // Clone turn context
            var clone = new TurnContext(context.Adapter, context.Activity);
            foreach (var pair in context.TurnState)
            {
                clone.TurnState.Add(pair.Key, pair.Value);
            }

            // Add conversation state & user state
            if (_conversationState == null)
            {
                _conversationState = clone.TurnState.Get<ConversationState>() ?? throw new ArgumentNullException(nameof(ConversationState));
            }
            else
            {
                clone.TurnState.Set(_conversationState);
            }

            if (_userState == null)
            {
                _userState = clone.TurnState.Get<UserState>();
            }
            else
            {
                clone.TurnState.Set(_userState);
            }

            // get dialog stack 
            var dialogsProperty = _conversationState.CreateProperty<DialogState>(_dialogName);
            var dialogState = await dialogsProperty.GetAsync(clone, () => new DialogState(), cancellationToken).ConfigureAwait(false);

            // Create DialogContext
            var dc = new DialogContext(_dialogs, clone, dialogState);

            // Register LG resources
            UseResourceExplorer(dc, _resourceExplorer);
            UseLanguageGeneration(dc);
            UseLanguagePolicy(dc, new LanguagePolicy(_defaultLocale));

            // map TurnState into root dialog context.services
            foreach (var service in clone.TurnState)
            {
                dc.Services[service.Key] = service.Value;
            }

            // get the DialogStateManager configuration
            var dialogStateManager = new DialogStateManager(dc);
            await dialogStateManager.LoadAllScopesAsync(cancellationToken).ConfigureAwait(false);
            dc.Context.TurnState.Set(dialogStateManager);

            return dc;
        }

        private static void UseResourceExplorer(DialogContext dc, ResourceExplorer resourceExplorer)
        {
            dc.Context.TurnState.Set(resourceExplorer);
        }

        private static Dictionary<ResourceExplorer, LanguageGeneratorManager> languageGeneratorManagers = new Dictionary<ResourceExplorer, LanguageGeneratorManager>();

        private static void UseLanguageGeneration(DialogContext dc, string defaultLg = null)
        {
            if (defaultLg == null)
            {
                defaultLg = "main.lg";
            }

            var resourceExplorer = dc.Context.TurnState.Get<ResourceExplorer>();

            if (resourceExplorer.TryGetResource(defaultLg, out var resource))
            {
                UseLanguageGeneration(dc, new ResourceMultiLanguageGenerator(defaultLg));
            }
            else
            {
                UseLanguageGeneration(dc, new TemplateEngineLanguageGenerator());
            }
        }

        private static void UseLanguageGeneration(DialogContext dc, LanguageGenerator languageGenerator)
        {
            var resourceExplorer = dc.Context.TurnState.Get<ResourceExplorer>();

            lock (languageGeneratorManagers)
            {
                if (!languageGeneratorManagers.TryGetValue(resourceExplorer ?? throw new InvalidOperationException($"Unable to get an instance of {nameof(resourceExplorer)}."), out var lgm))
                {
                    lgm = new LanguageGeneratorManager(resourceExplorer);
                    languageGeneratorManagers[resourceExplorer] = lgm;
                }

                dc.Context.TurnState.Set<LanguageGeneratorManager>(lgm);
                dc.Context.TurnState.Set<LanguageGenerator>(languageGenerator ?? throw new ArgumentNullException(nameof(languageGenerator)));
            }
        }

        private static void UseLanguagePolicy(DialogContext dc, LanguagePolicy policy)
        {
            dc.Context.TurnState.Set<LanguagePolicy>(policy);
        }
    }
}
