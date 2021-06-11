using Microsoft.Bot.Connector;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using System;
using Underscore.Bot.MessageRouting.DataStore;

namespace Underscore.Bot.MessageRouting.Utils
{
    /// <summary>
    /// A utility class for sending messages.
    /// </summary>
    public class ConnectorClientMessageBundle
    {
        public ConnectorClient ConnectorClient
        {
            get;
            set;
        }

        public IMessageActivity MessageActivity
        {
            get;
            set;
        }

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="serviceUrl">The service URL.</param>
        /// <param name="messageActivity">The message activity to send.</param>
        /// <param name="microsoftAppCredentials">The credentials.</param>
        public ConnectorClientMessageBundle(
            string serviceUrl, IMessageActivity messageActivity,
            MicrosoftAppCredentials microsoftAppCredentials = null)
        {
            if (microsoftAppCredentials == null)
            {
                ConnectorClient = new ConnectorClient(new Uri(serviceUrl));
            }
            else
            {
                ConnectorClient = new ConnectorClient(new Uri(serviceUrl), microsoftAppCredentials);
            }

            MessageActivity = messageActivity;
        }

        /// <summary>
        /// Creates a new message activity and populates it based on the given arguments.
        /// </summary>
        /// <param name="sender">The channel account of the sender.</param>
        /// <param name="recipient">The conversation reference of the recipient.</param>
        /// <param name="message">The message content.</param>
        /// <returns>A newly created message activity.</returns>
        public static IMessageActivity CreateMessageActivity(
            ChannelAccount sender, ConversationReference recipient, string message)
        {
            IMessageActivity messageActivity = Activity.CreateMessageActivity();

            if (sender != null)
            {
                messageActivity.From = sender;
            }

            if (recipient != null)
            {
                if (recipient.Conversation != null)
                {
                    messageActivity.Conversation = recipient.Conversation;
                }

                ChannelAccount recipientChannelAccount =
                    RoutingDataManager.GetChannelAccount(recipient);

                if (recipientChannelAccount != null)
                {
                    messageActivity.Recipient = recipientChannelAccount;
                }
            }

            messageActivity.Text = message;
            return messageActivity;
        }
    }
}