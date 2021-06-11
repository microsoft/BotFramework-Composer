using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder.Dialogs;
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
    public class PostDialog : Dialog
    {
        [JsonConstructor]
        public PostDialog([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0)
           : base()
        {
            // enable instances of this command as debug break point
            this.RegisterSourceLocation(sourceFilePath, sourceLineNumber);

            // load dependency service
            _messageRouter = Configuration.MessageRouter;
        }

        [JsonProperty("$kind")]
        public const string Kind = nameof(PostDialog);
        private readonly MessageRouter _messageRouter;

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
            _messageRouter.StoreConversationReferences(activity);

            var messageRouterResult = await _messageRouter.RouteMessageIfSenderIsConnectedAsync(activity);

            if (ResultProperty != null)
                dc.State.SetValue(ResultProperty.GetValue(dc.State), messageRouterResult);

            return await dc.EndDialogAsync(null, cancellationToken);
        }
    }
}
