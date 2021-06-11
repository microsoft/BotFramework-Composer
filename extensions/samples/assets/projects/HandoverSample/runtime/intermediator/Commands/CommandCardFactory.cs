using Microsoft.Bot.Schema;
using Microsoft.BotFramework.Composer.Intermediator.Resources;
using System;
using System.Collections.Generic;
using System.Globalization;
using Underscore.Bot.MessageRouting.DataStore;
using Underscore.Bot.MessageRouting.Models;

namespace Microsoft.BotFramework.Composer.Intermediator
{
    public class CommandCardFactory
    {
        /// <summary>
        /// Creates a large connection request card.
        /// </summary>
        /// <param name="connectionRequest">The connection request.</param>
        /// <param name="botName">The name of the bot (optional).</param>
        /// <returns>A newly created request card.</returns>
        public static HeroCard CreateConnectionRequestCard(
            ConnectionRequest connectionRequest, string botName = null)
        {
            if (connectionRequest == null || connectionRequest.Requestor == null)
            {
                throw new ArgumentNullException("The connection request or the conversation reference of the requestor is null");
            }

            ChannelAccount requestorChannelAccount =
                RoutingDataManager.GetChannelAccount(connectionRequest.Requestor);

            if (requestorChannelAccount == null)
            {
                throw new ArgumentNullException("The channel account of the requestor is null");
            }

            string requestorChannelAccountName = string.IsNullOrEmpty(requestorChannelAccount.Name)
                ? StringConstants.NoUserNamePlaceholder : requestorChannelAccount.Name;
            string requestorChannelId =
                CultureInfo.CurrentCulture.TextInfo.ToTitleCase(connectionRequest.Requestor.ChannelId);

            var acceptValue = $"Accept {connectionRequest.Requestor.Conversation?.Id} {requestorChannelAccount?.Id}";
            var rejectValue = $"Reject {connectionRequest.Requestor.Conversation?.Id} {requestorChannelAccount?.Id}";

            HeroCard card = new HeroCard()
            {
                Title = Strings.ConnectionRequestTitle,
                Subtitle = string.Format(Strings.RequestorDetailsTitle, requestorChannelAccountName, requestorChannelId),
                Text = string.Format(Strings.AcceptRejectConnectionHint, acceptValue, rejectValue),

                Buttons = new List<CardAction>()
                {
                    new CardAction()
                    {
                        Title = Strings.AcceptRequestButtonLabel,
                        Type = ActionTypes.ImBack,
                        Value = acceptValue
                    },
                    new CardAction()
                    {
                        Title = Strings.RejectRequestButtonLabel,
                        Type = ActionTypes.ImBack,
                        Value = rejectValue
                    }
                }
            };

            return card;
        }

        /// <summary>
        /// Creates multiple large connection request cards.
        /// </summary>
        /// <param name="connectionRequests">The connection requests.</param>
        /// <param name="botName">The name of the bot (optional).</param>
        /// <returns>A list of request cards as attachments.</returns>
        public static IList<Attachment> CreateMultipleConnectionRequestCards(
            IList<ConnectionRequest> connectionRequests, string botName = null)
        {
            IList<Attachment> attachments = new List<Attachment>();

            foreach (ConnectionRequest connectionRequest in connectionRequests)
            {
                attachments.Add(CreateConnectionRequestCard(connectionRequest, botName).ToAttachment());
            }

            return attachments;
        }
    }
}
