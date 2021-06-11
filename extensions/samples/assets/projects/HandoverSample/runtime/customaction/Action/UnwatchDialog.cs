using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.BotFramework.Composer.Intermediator.Resources;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting;

namespace Microsoft.BotFramework.Composer.CustomAction.Action
{
    public class UnwatchDialog : Dialog
    {
        private readonly MessageRouter _messageRouter;
        private readonly ILogger<WatchDialog> _logger;

        [JsonConstructor]
        public UnwatchDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
            _logger = Configuration.LoggerFactory.CreateLogger<WatchDialog>();
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(UnwatchDialog);

        /// <summary>
        /// Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
        /// </summary>
        /// <value>
        /// Caller's memory path to store the result of this step in (ex: conversation.area).
        /// </value>
        [JsonProperty("resultProperty")]
        public StringExpression ResultProperty { get; set; }

        public override async Task<DialogTurnResult> BeginDialogAsync(DialogContext dc, object options = null, CancellationToken cancellationToken = default)
        {
            Activity replyActivity = null;
            var activity = dc.Context.Activity;
            bool success = false;

            ConversationReference sender = MessageRouter.CreateSenderConversationReference(activity);

            if (_messageRouter.RoutingDataManager.IsAssociatedWithAggregation(sender))
            {
                ConversationReference aggregationChannelToRemove = new ConversationReference(
                        null, null, null,
                        activity.Conversation, activity.ChannelId, activity.ServiceUrl);

                if (_messageRouter.RoutingDataManager.RemoveAggregationChannel(aggregationChannelToRemove))
                {
                    replyActivity = activity.CreateReply(Strings.AggregationChannelRemoved);
                    success = true;
                }
                else
                {
                    replyActivity = activity.CreateReply(Strings.FailedToRemoveAggregationChannel);
                }
            }

            if (ResultProperty != null)
                dc.State.SetValue(ResultProperty.GetValue(dc.State), success);

            await dc.Context.SendActivityAsync(replyActivity, cancellationToken);

            return await dc.EndDialogAsync(success, cancellationToken);
        }
    }
}
