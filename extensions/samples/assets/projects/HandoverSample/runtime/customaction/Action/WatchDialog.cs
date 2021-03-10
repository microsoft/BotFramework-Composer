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
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.BotFramework.Composer.Intermediator.Resources;

namespace Microsoft.BotFramework.Composer.CustomAction.Action
{
    public class WatchDialog : Dialog
    {
        private readonly MessageRouter _messageRouter;
        private readonly ILogger<WatchDialog> _logger;

        [JsonConstructor]
        public WatchDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
            _logger = Configuration.LoggerFactory.CreateLogger<WatchDialog>();
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(WatchDialog);

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
            Activity replyMessage = null;
            var activity = dc.Context.Activity;

            ConversationReference aggregationChannelToAdd = new ConversationReference(
                null, null, null,
                activity.Conversation, activity.ChannelId, activity.ServiceUrl);

            ModifyRoutingDataResult modifyRoutingDataResult =
                _messageRouter.RoutingDataManager.AddAggregationChannel(aggregationChannelToAdd);

            if (modifyRoutingDataResult.Type == ModifyRoutingDataResultType.Added)
            {
                replyMessage = activity.CreateReply(Strings.AggregationChannelSet);
            }
            else if (modifyRoutingDataResult.Type == ModifyRoutingDataResultType.AlreadyExists)
            {
                replyMessage = activity.CreateReply(Strings.AggregationChannelAlreadySet);
            }
            else if (modifyRoutingDataResult.Type == ModifyRoutingDataResultType.Error)
            {
                replyMessage = activity.CreateReply(string.Format(Strings.FailedToSetAggregationChannel, modifyRoutingDataResult.ErrorMessage));
            }

            _logger.LogInformation($"{replyMessage.Text} - {activity.From.Id}");
            await dc.Context.SendActivityAsync(replyMessage, cancellationToken);


            if (ResultProperty != null)
                dc.State.SetValue(ResultProperty.GetValue(dc.State), true);

            return await dc.EndDialogAsync(true, cancellationToken);
        }
    }
}
