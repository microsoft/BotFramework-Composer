using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.BotFramework.Composer.Intermediator;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting;
using Underscore.Bot.MessageRouting.Models;

namespace Microsoft.BotFramework.Composer.CustomAction.Action
{
    public class GetRequestsDialog : Dialog
    {
        private readonly MessageRouter _messageRouter;
        private readonly ILogger<GetRequestsDialog> _logger;

        [JsonConstructor]
        public GetRequestsDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
            _logger = Configuration.LoggerFactory.CreateLogger<GetRequestsDialog>();
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(GetRequestsDialog);

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

            IList<ConnectionRequest> connectionRequests =
                        _messageRouter.RoutingDataManager.GetConnectionRequests();

            replyActivity = activity.CreateReply();

            if (connectionRequests.Count == 0)
            {
                replyActivity.Text = "No pending requests";
            }
            else
            {
                replyActivity.Attachments = CommandCardFactory.CreateMultipleConnectionRequestCards(
                    connectionRequests, activity.Recipient?.Name);
            }

            replyActivity.ChannelData = JsonConvert.SerializeObject(connectionRequests);
            await dc.Context.SendActivityAsync(replyActivity, cancellationToken);

            return await dc.EndDialogAsync(null, cancellationToken);
        }
    }
}
