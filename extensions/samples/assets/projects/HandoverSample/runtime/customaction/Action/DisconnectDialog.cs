using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.BotFramework.Composer.Intermediator;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting;
using Underscore.Bot.MessageRouting.Results;

namespace Microsoft.BotFramework.Composer.CustomAction.Action
{
    public class DisconnectDialog : Dialog
    {
        private readonly MessageRouter _messageRouter;
        private readonly MessageRouterResultHandler _messageRouterResultHandler;
        private readonly ILogger<DisconnectDialog> _logger;

        [JsonConstructor]
        public DisconnectDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
            : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
            _messageRouterResultHandler = Configuration.MessageRouterResultHandler;
            _logger = Configuration.LoggerFactory.CreateLogger<DisconnectDialog>();
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(DisconnectDialog);

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
            var activity = dc.Context.Activity;
            ConversationReference sender = MessageRouter.CreateSenderConversationReference(activity);

            // End the 1:1 conversation(s)
            IList<ConnectionResult> disconnectResults = _messageRouter.Disconnect(sender);

            if (disconnectResults != null && disconnectResults.Count > 0)
            {
                foreach (ConnectionResult disconnectResult in disconnectResults)
                {
                    await _messageRouterResultHandler.HandleResultAsync(disconnectResult);
                }
            }

            return await dc.EndDialogAsync(null, cancellationToken);
        }
    }
}
