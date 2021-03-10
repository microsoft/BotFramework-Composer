using Microsoft.Bot.Builder;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting;

namespace Microsoft.BotFramework.Composer.Intermediator.Middleware
{
    public class StoreConversationMiddleware : IMiddleware
    {
        private readonly MessageRouter _messageRouter;
        private readonly ILogger<StoreConversationMiddleware> _logger;

        public StoreConversationMiddleware(MessageRouter messageRouter, ILogger<StoreConversationMiddleware> logger)
        {
            _messageRouter = messageRouter;
            _logger = logger;
        }

        public Task OnTurnAsync(ITurnContext turnContext, NextDelegate next, CancellationToken cancellationToken = default)
        {
            _messageRouter.StoreConversationReferences(turnContext?.Activity);
            return next(cancellationToken);
        }
    }
}
