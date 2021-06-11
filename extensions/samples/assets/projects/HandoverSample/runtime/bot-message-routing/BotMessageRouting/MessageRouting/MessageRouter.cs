using Microsoft.Bot.Connector;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.Bot.Schema;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting.DataStore;
using Underscore.Bot.MessageRouting.Logging;
using Underscore.Bot.MessageRouting.Models;
using Underscore.Bot.MessageRouting.Results;
using Underscore.Bot.MessageRouting.Utils;

namespace Underscore.Bot.MessageRouting
{
    /// <summary>
    /// Provides the main interface for message routing.
    /// </summary>
    public class MessageRouter
    {
        protected MicrosoftAppCredentials _microsoftAppCredentials;

        /// <summary>
        /// The routing data and all the parties the bot has seen including the instances of itself.
        /// </summary>
        public RoutingDataManager RoutingDataManager
        {
            get;
            protected set;
        }

        public ILogger Logger
        {
            get;
            set;
        }

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="routingDataStore">The routing data store implementation.</param>
        /// <param name="microsoftAppCredentials">The bot application credentials.
        /// May be required, depending on the setup of your app, for sending messages.</param>
        /// <param name="globalTimeProvider">The global time provider for providing the current
        /// <param name="ILogger">Logger to use. Defaults to DebugLogger.</param>
        /// time for various events such as when a connection is requested.</param>
        public MessageRouter(
            IRoutingDataStore routingDataStore,
            MicrosoftAppCredentials microsoftAppCredentials,
            GlobalTimeProvider globalTimeProvider = null,
            ILogger logger = null)
        {
            Logger = logger ?? new DebugLogger();
            RoutingDataManager = new RoutingDataManager(routingDataStore, globalTimeProvider, Logger);
            _microsoftAppCredentials = microsoftAppCredentials;
        }

        /// <summary>
        /// Constructs a conversation reference instance using the sender of the given activity.
        /// </summary>
        /// <param name="activity">The activity.</param>
        /// <param name="senderIsBot">Defines whether to classify the sender as a bot or a user.</param>
        /// <returns>A newly created conversation reference instance.</returns>
        public static ConversationReference CreateSenderConversationReference(
            IActivity activity, bool senderIsBot = false)
        {
            return new ConversationReference(
                null,
                senderIsBot ? null : activity.From,
                senderIsBot ? activity.From : null,
                activity.Conversation,
                activity.ChannelId,
                activity.ServiceUrl);
        }

        /// <summary>
        /// Constructs a conversation reference instance using the recipient, which is expected to
        /// be a bot instance, of the given activity.
        /// </summary>
        /// <param name="activity">The activity.</param>
        /// <returns>A newly created conversation reference instance.</returns>
        public static ConversationReference CreateRecipientConversationReference(IActivity activity)
        {
            return new ConversationReference(
                null,
                null,
                activity.Recipient,
                activity.Conversation,
                activity.ChannelId,
                activity.ServiceUrl);
        }

        /// <summary>
        /// Sends the given message to the given recipient.
        /// </summary>
        /// <param name="recipient">The conversation reference of the recipient.</param>
        /// <param name="messageActivity">The message activity to send.</param>
        /// <returns>A valid resource response instance, if successful. Null in case of an error.</returns>
        public virtual async Task<ResourceResponse> SendMessageAsync(
            ConversationReference recipient, IMessageActivity messageActivity)
        {
            if (recipient == null)
            {
                Logger.Log("The conversation reference is null");
                return null;
            }

            // We need the bot identity in the SAME CHANNEL/CONVERSATION as the RECIPIENT -
            // Otherwise, the platform (e.g. Slack) will reject the incoming message as it does not
            // recognize the sender
            ConversationReference botInstance =
                RoutingDataManager.FindBotInstanceForRecipient(recipient);

            if (botInstance == null || botInstance.Bot == null)
            {
                Logger.Log("Failed to find the bot instance");
                return null;
            }

            messageActivity.From = botInstance.Bot;
            messageActivity.Recipient = RoutingDataManager.GetChannelAccount(recipient);

            // Make sure the message activity contains a valid conversation ID
            if (messageActivity.Conversation == null)
            {
                messageActivity.Conversation = recipient.Conversation;
            }

            ConnectorClientMessageBundle bundle = new ConnectorClientMessageBundle(
                recipient.ServiceUrl, messageActivity, _microsoftAppCredentials);

            ResourceResponse resourceResponse = null;

            try
            {
                Logger.Log($"Sending message {bundle.MessageActivity.Text} from {bundle.MessageActivity.From.Id} to {bundle.MessageActivity.Recipient?.Id}");
                resourceResponse =
                    await bundle.ConnectorClient.Conversations.SendToConversationAsync(
                        (Activity)bundle.MessageActivity);
            }
            catch (UnauthorizedAccessException e)
            {
                Logger.LogError($"Failed to send message: {e.Message}");
            }
            catch (Exception e)
            {
                Logger.LogError($"Failed to send message: {e.Message}");
            }

            return resourceResponse;
        }

        /// <summary>
        /// Sends the given message to the given recipient.
        /// </summary>
        /// <param name="recipient">The conversation reference of the recipient.</param>
        /// <param name="message">The message to send.</param>
        /// <returns>A valid resource response instance, if successful. Null in case of an error.</returns>
        public virtual async Task<ResourceResponse> SendMessageAsync(
            ConversationReference recipient, string message)
        {
            IMessageActivity messageActivity =
                ConnectorClientMessageBundle.CreateMessageActivity(null, recipient, message);

            // The sender to the message activity above is resolved in the method here:
            return await SendMessageAsync(recipient, messageActivity);
        }

        /// <summary>
        /// Stores the conversation reference instances (sender and recipient) in the given activity.
        /// </summary>
        /// <param name="activity">The activity.</param>
        /// <returns>The list of two results, where the first element is for the sender and the last for the recipient.</returns>
        public IList<ModifyRoutingDataResult> StoreConversationReferences(IActivity activity)
        {
            return new List<ModifyRoutingDataResult>()
            {
                RoutingDataManager.AddConversationReference(CreateSenderConversationReference(activity)),
                RoutingDataManager.AddConversationReference(CreateRecipientConversationReference(activity))
            };
        }

        /// <summary>
        /// Tries to initiate a connection (1:1 conversation) by creating a request on behalf of
        /// the given requestor. This method does nothing, if a request for the same user already exists.
        /// </summary>
        /// <param name="requestor">The requestor conversation reference.</param>
        /// <param name="rejectConnectionRequestIfNoAggregationChannel">
        /// If true, will reject all requests, if there is no aggregation channel.</param>
        /// <returns>The result of the operation:
        /// - ConnectionRequestResultType.Created,
        /// - ConnectionRequestResultType.AlreadyExists,
        /// - ConnectionRequestResultType.NotSetup or
        /// - ConnectionRequestResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionRequestResult CreateConnectionRequest(
            ConversationReference requestor, bool rejectConnectionRequestIfNoAggregationChannel = false)
        {
            if (requestor == null)
            {
                throw new ArgumentNullException("Requestor missing");
            }

            ConnectionRequestResult createConnectionRequestResult = null;
            RoutingDataManager.AddConversationReference(requestor);
            ConnectionRequest connectionRequest = new ConnectionRequest(requestor);

            if (RoutingDataManager.IsAssociatedWithAggregation(requestor))
            {
                createConnectionRequestResult = new ConnectionRequestResult()
                {
                    Type = ConnectionRequestResultType.Error,
                    ErrorMessage = $"The given ConversationReference ({RoutingDataManager.GetChannelAccount(requestor)?.Name}) is associated with aggregation and hence invalid to request a connection"
                };
            }
            else
            {
                createConnectionRequestResult = RoutingDataManager.AddConnectionRequest(
                    connectionRequest, rejectConnectionRequestIfNoAggregationChannel);
            }

            return createConnectionRequestResult;
        }

        /// <summary>
        /// Tries to reject the connection request of the associated with the given conversation reference.
        /// </summary>
        /// <param name="requestorToReject">The conversation reference of the party whose request to reject.</param>
        /// <param name="rejecter">The conversation reference of the party  rejecting the request (optional).</param>
        /// <returns>The result of the operation:
        /// - ConnectionRequestResultType.Rejected or
        /// - ConnectionRequestResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionRequestResult RejectConnectionRequest(
            ConversationReference requestorToReject, ConversationReference rejecter = null)
        {
            if (requestorToReject == null)
            {
                throw new ArgumentNullException("The conversation reference instance of the party whose request to reject cannot be null");
            }

            ConnectionRequestResult rejectConnectionRequestResult = null;
            ConnectionRequest connectionRequest =
                RoutingDataManager.FindConnectionRequest(requestorToReject);

            if (connectionRequest != null)
            {
                rejectConnectionRequestResult = RoutingDataManager.RemoveConnectionRequest(connectionRequest);
                rejectConnectionRequestResult.Rejecter = rejecter;
            }

            return rejectConnectionRequestResult;
        }

        /// <summary>
        /// Tries to establish a connection (1:1 chat) between the two given parties.
        ///
        /// Note that the conversation owner will have a new separate conversation reference in the created
        /// conversation, if a new direct conversation is created.
        /// </summary>
        /// <param name="conversationReference1">The conversation reference who owns the conversation (e.g. customer service agent).</param>
        /// <param name="conversationReference2">The other conversation reference in the conversation.</param>
        /// <param name="createNewDirectConversation">
        /// If true, will try to create a new direct conversation between the bot and the
        /// conversation owner (e.g. agent) where the messages from the other (client) conversation
        /// reference are routed.
        ///
        /// Note that this will result in the conversation owner having a new separate conversation
        /// reference in the created connection (for the new direct conversation).
        /// </param>
        /// <returns>
        /// The result of the operation:
        /// - ConnectionResultType.Connected,
        /// - ConnectionResultType.Error (see the error message for more details).
        /// </returns>
        public virtual async Task<ConnectionResult> ConnectAsync(
            ConversationReference conversationReference1,
            ConversationReference conversationReference2,
            bool createNewDirectConversation)
        {
            if (conversationReference1 == null || conversationReference2 == null)
            {
                throw new ArgumentNullException(
                    $"Neither of the arguments ({nameof(conversationReference1)}, {nameof(conversationReference2)}) can be null");
            }

            ConversationReference botInstance =
                RoutingDataManager.FindConversationReference(
                    conversationReference1.ChannelId, conversationReference1.Conversation.Id, null, true);

            if (botInstance == null)
            {
                return new ConnectionResult()
                {
                    Type = ConnectionResultType.Error,
                    ErrorMessage = "Failed to find the bot instance"
                };
            }

            ConversationResourceResponse conversationResourceResponse = null;

            if (createNewDirectConversation)
            {
                ChannelAccount conversationReference1ChannelAccount =
                    RoutingDataManager.GetChannelAccount(
                        conversationReference1, out bool conversationReference1IsBot);

                ConnectorClient connectorClient = new ConnectorClient(
                    new Uri(conversationReference1.ServiceUrl), _microsoftAppCredentials);

                try
                {
                    conversationResourceResponse =
                        await connectorClient.Conversations.CreateDirectConversationAsync(
                            botInstance.Bot, conversationReference1ChannelAccount);
                }
                catch (Exception e)
                {
                    Logger.Log($"Failed to create a direct conversation: {e.Message}");
                    // Do nothing here as we fallback (continue without creating a direct conversation)
                }

                if (conversationResourceResponse != null
                    && !string.IsNullOrEmpty(conversationResourceResponse.Id))
                {
                    // The conversation account of the conversation owner for this 1:1 chat is different -
                    // thus, we need to re-create the conversation owner instance
                    ConversationAccount directConversationAccount =
                        new ConversationAccount(id: conversationResourceResponse.Id);

                    //conversationReference1 = new ConversationReference(
                    //    null,
                    //    conversationReference1IsBot ? null : conversationReference1ChannelAccount,
                    //    conversationReference1IsBot ? conversationReference1ChannelAccount : null,
                    //    directConversationAccount,
                    //    conversationReference1.ChannelId,
                    //    conversationReference1.ServiceUrl);

                    RoutingDataManager.AddConversationReference(conversationReference1);

                    //RoutingDataManager.AddConversationReference(new ConversationReference(
                    //    null,
                    //    null,
                    //    botInstance.Bot,
                    //    directConversationAccount,
                    //    botInstance.ChannelId,
                    //    botInstance.ServiceUrl));
                }
            }

            Connection connection = new Connection(conversationReference1, conversationReference2);
            ConnectionResult connectResult =
                RoutingDataManager.ConnectAndRemoveConnectionRequest(connection, conversationReference2);
            connectResult.ConversationResourceResponse = conversationResourceResponse;

            return connectResult;
        }

        /// <summary>
        /// Disconnects all connections associated with the given conversation reference.
        /// </summary>
        /// <param name="conversationReference">The conversation reference connected in a conversation.</param>
        /// <returns>The results:
        /// - ConnectionResultType.Disconnected,
        /// - ConnectionResultType.Error (see the error message for more details).
        /// </returns>
        public virtual IList<ConnectionResult> Disconnect(ConversationReference conversationReference)
        {
            IList<ConnectionResult> disconnectResults = new List<ConnectionResult>();
            bool wasDisconnected = true;

            while (wasDisconnected)
            {
                wasDisconnected = false;
                Connection connection = RoutingDataManager.FindConnection(conversationReference);

                if (connection != null)
                {
                    ConnectionResult disconnectResult = RoutingDataManager.Disconnect(connection);
                    disconnectResults.Add(disconnectResult);

                    if (disconnectResult.Type == ConnectionResultType.Disconnected)
                    {
                        wasDisconnected = true;
                    }
                }
            }

            return disconnectResults;
        }

        /// <summary>
        /// Routes the message in the given activity, if the sender is connected in a conversation.
        /// </summary>
        /// <param name="activity">The activity to handle.</param>
        /// <param name="addNameToMessage">If true, will add the name of the sender to the beginning of the message.</param>
        /// <returns>The result of the operation:
        /// - MessageRouterResultType.NoActionTaken, if no routing rule for the sender is found OR
        /// - MessageRouterResultType.OK, if the message was routed successfully OR
        /// - MessageRouterResultType.FailedToForwardMessage in case of an error (see the error message).
        /// </returns>
        public virtual async Task<MessageRoutingResult> RouteMessageIfSenderIsConnectedAsync(
            IMessageActivity activity, bool addNameToMessage = true)
        {
            ConversationReference sender = CreateSenderConversationReference(activity);
            Connection connection = RoutingDataManager.FindConnection(sender);

            MessageRoutingResult messageRoutingResult = new MessageRoutingResult()
            {
                Type = MessageRoutingResultType.NoActionTaken,
                Connection = connection
            };

            if (connection != null)
            {
                ConversationReference recipient =
                    RoutingDataManager.Match(sender, connection.ConversationReference1)
                        ? connection.ConversationReference2 : connection.ConversationReference1;

                if (recipient != null)
                {
                    string message = activity.Text;

                    if (addNameToMessage)
                    {
                        string senderName = RoutingDataManager.GetChannelAccount(sender).Name;

                        if (!string.IsNullOrWhiteSpace(senderName))
                        {
                            message = $"{senderName}: {message}";
                        }
                    }

                    ResourceResponse resourceResponse = await SendMessageAsync(recipient, message);

                    if (resourceResponse != null)
                    {
                        messageRoutingResult.Type = MessageRoutingResultType.MessageRouted;

                        if (!RoutingDataManager.UpdateTimeSinceLastActivity(connection))
                        {
                            Logger.Log("Failed to update the time since the last activity property of the connection");
                        }
                    }
                    else
                    {
                        messageRoutingResult.Type = MessageRoutingResultType.FailedToRouteMessage;
                        messageRoutingResult.ErrorMessage = $"Failed to forward the message to the recipient";
                    }
                }
                else
                {
                    messageRoutingResult.Type = MessageRoutingResultType.Error;
                    messageRoutingResult.ErrorMessage = "Failed to find the recipient to forward the message to";
                }
            }

            return messageRoutingResult;
        }
    }
}