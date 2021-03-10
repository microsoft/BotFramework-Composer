using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting;
using Underscore.Bot.MessageRouting.Results;
using Microsoft.Extensions.Logging;
using Microsoft.BotFramework.Composer.Intermediator;

namespace Microsoft.BotFramework.Composer.CustomAction.Action
{
    public class AcceptOrRejectDialog : Dialog
    {
        private readonly MessageRouter _messageRouter;
        private readonly ILogger<AcceptOrRejectDialog> _logger;
        private readonly MessageRouterResultHandler _messageRouterResultHandler;
        private readonly ConnectionRequestHandler _connectionRequestHandler;

        [JsonConstructor]
        public AcceptOrRejectDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
            _logger = Configuration.LoggerFactory.CreateLogger<AcceptOrRejectDialog>();
            _messageRouterResultHandler = Configuration.MessageRouterResultHandler;
            _connectionRequestHandler = new ConnectionRequestHandler();
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(AcceptOrRejectDialog);


        [JsonProperty("conversationProperty")]
        public StringExpression ConversationProperty { get; set; }

        [JsonProperty("userIdProperty")]
        public StringExpression UserProperty { get; set; }

        [JsonProperty("acceptProperty")]
        public BoolExpression AcceptProperty { get; set; }

        [JsonProperty("resultProperty")]
        public StringExpression ResultProperty { get; set; }

        public override async Task<DialogTurnResult> BeginDialogAsync(DialogContext dc, object options = null, CancellationToken cancellationToken = default)
        {
            var activity = dc.Context.Activity;
            bool success = false;

            var conversation = ConversationProperty.GetValue(dc.State);
            var userId = UserProperty.GetValue(dc.State);
            var accept = AcceptProperty.GetValue(dc.State);

            Activity replyActivity = null;
            ConversationReference sender = MessageRouter.CreateSenderConversationReference(activity);

            if (_messageRouter.RoutingDataManager.IsAssociatedWithAggregation(sender))
            {
                // The sender is associated with the aggregation and has the right to accept/reject
                if (string.IsNullOrEmpty(conversation) && string.IsNullOrEmpty(userId))
                {
                    replyActivity = activity.CreateReply();

                    var connectionRequests = _messageRouter.RoutingDataManager.GetConnectionRequests();

                    if (connectionRequests.Count == 0)
                    {
                        replyActivity.Text = "Strings.NoPendingRequests";
                    }
                    else
                    {
                        //replyActivity = CommandCardFactory.AddCardToActivity(
                        //    replyActivity, CommandCardFactory.CreateMultiConnectionRequestCard(
                        //        connectionRequests, doAccept, activity.Recipient?.Name));
                    }
                }
                else if (!string.IsNullOrEmpty(conversation) || !string.IsNullOrEmpty(userId))
                {
                    // Try to accept the specified connection request
                    ChannelAccount requestorChannelAccount =
                        new ChannelAccount(userId);
                    ConversationAccount requestorConversationAccount =
                        new ConversationAccount(null, null, conversation);

                    _logger.LogDebug($"Accepting user {userId} @ {conversation}");
                    AbstractMessageRouterResult messageRouterResult =
                        await _connectionRequestHandler.AcceptOrRejectRequestAsync(
                            _messageRouter, _messageRouterResultHandler, sender, accept,
                            requestorChannelAccount, requestorConversationAccount);

                    await _messageRouterResultHandler.HandleResultAsync(messageRouterResult);
                    success = true;
                }
                else
                {
                    replyActivity = activity.CreateReply(Intermediator.Resources.Strings.InvalidOrMissingCommandParameter);
                }
            }

            if (!success)
                await dc.Context.SendActivityAsync(replyActivity, cancellationToken);

            if (ResultProperty != null)
                dc.State.SetValue(ResultProperty.GetValue(dc.State), success);

            return await dc.EndDialogAsync(success, cancellationToken);
        }
    }
}
