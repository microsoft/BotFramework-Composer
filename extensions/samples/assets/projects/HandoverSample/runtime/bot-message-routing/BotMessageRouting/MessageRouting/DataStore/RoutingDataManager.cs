using Microsoft.Bot.Schema;
using System;
using System.Collections.Generic;
using System.Linq;
using Underscore.Bot.MessageRouting.Logging;
using Underscore.Bot.MessageRouting.Models;
using Underscore.Bot.MessageRouting.Results;
using Underscore.Bot.MessageRouting.Utils;

namespace Underscore.Bot.MessageRouting.DataStore
{
    /// <summary>
    /// The routing data manager.
    /// </summary>
    [Serializable]
    public class RoutingDataManager
    {
        protected ILogger _logger;

        public IRoutingDataStore RoutingDataStore
        {
            get;
            protected set;
        }

        /// <summary>
        /// A global time provider.
        /// Used for providing the current time for various of events.
        /// For instance, the time when a connection request is made may be useful for customer
        /// agent front-ends to see who has waited the longest and/or to collect response times.
        /// </summary>
        public virtual GlobalTimeProvider GlobalTimeProvider
        {
            get;
            protected set;
        }

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="routingDataStore">The routing data store implementation.</param>
        /// <param name="globalTimeProvider">The global time provider for providing the current
        /// time for various events such as when a connection is requested.</param>
        /// <param name="logger">Logger to use.</param>
        public RoutingDataManager(
            IRoutingDataStore routingDataStore,
            GlobalTimeProvider globalTimeProvider = null,
            ILogger logger = null)
        {
            RoutingDataStore = routingDataStore ?? throw new ArgumentNullException("Routing data store missing");
            GlobalTimeProvider = globalTimeProvider ?? new GlobalTimeProvider();
            _logger = logger ?? new DebugLogger();
        }

        #region Static helper methods

        /// <summary>
        /// Checks if the given conversation reference contains the channel account instance of a bot.
        /// </summary>
        /// <param name="conversationReference">The conversation reference to check.</param>
        /// <returns>True, if the given conversation reference is associated with a bot. False otherwise.</returns>
        public static bool IsBot(ConversationReference conversationReference)
        {
            return (conversationReference?.Bot != null);
        }

        /// <summary>
        /// Resolves the non-null channel account instance in the given conversation reference.
        /// </summary>
        /// <param name="conversationReference">The conversation reference whose channel account to resolve.</param>
        /// <param name="isBot">Will be true, if the conversation reference is associated with a bot. False otherwise.</param>
        /// <returns>The non-null channel account instance (user or bot) or null, if both are null.</returns>
        public static ChannelAccount GetChannelAccount(ConversationReference conversationReference, out bool isBot)
        {
            if (conversationReference?.User != null)
            {
                isBot = false;
                return conversationReference.User;
            }

            if (conversationReference?.Bot != null)
            {
                isBot = true;
                return conversationReference.Bot;
            }

            isBot = false;
            return null;
        }

        /// <summary>
        /// Resolves the non-null channel account instance in the given conversation reference.
        /// </summary>
        /// <param name="conversationReference">The conversation reference whose channel account to resolve.</param>
        /// <returns>The non-null channel account instance (user or bot) or null, if both are null.</returns>
        public static ChannelAccount GetChannelAccount(ConversationReference conversationReference)
        {
            return GetChannelAccount(conversationReference, out bool isBot);
        }

        /// <summary>
        /// Compares the conversation and channel account instances of the two given conversation references.
        /// </summary>
        /// <param name="conversationReference1"></param>
        /// <param name="conversationReference2"></param>
        /// <returns>True, if the IDs match. False otherwise.</returns>
        public static bool Match(
            ConversationReference conversationReference1, ConversationReference conversationReference2)
        {
            if (conversationReference1 == null || conversationReference2 == null)
            {
                return false;
            }

            string conversationAccount1Id = conversationReference1.Conversation?.Id;
            string conversationAccount2Id = conversationReference2.Conversation?.Id;

            if (string.IsNullOrWhiteSpace(conversationAccount1Id) != string.IsNullOrWhiteSpace(conversationAccount2Id))
            {
                return false;
            }

            bool conversationAccountsMatch =
                (string.IsNullOrWhiteSpace(conversationAccount1Id)
                 && string.IsNullOrWhiteSpace(conversationAccount2Id))
                || conversationAccount1Id.Equals(conversationAccount2Id);

            ChannelAccount channelAccount1 = GetChannelAccount(conversationReference1, out bool isBot1);
            ChannelAccount channelAccount2 = GetChannelAccount(conversationReference2, out bool isBot2);

            bool channelAccountsMatch =
                (isBot1 == isBot2)
                && ((channelAccount1 == null && channelAccount2 == null)
                    || (channelAccount1 != null && channelAccount2 != null
                        && channelAccount1.Id.Equals(channelAccount2.Id)));

            return (conversationAccountsMatch && channelAccountsMatch);
        }

        /// <summary>
        /// Checks whether the given list of conversation references contains the given one.
        /// </summary>
        /// <param name="conversationReferences">The list of conversation references possibly containing the given one.</param>
        /// <param name="conversationReferenceToCheck">The conversation reference to check.</param>
        /// <returns>True, if the given conversation reference is contained by the list. False otherwise.</returns>
        public static bool Contains(
            IList<ConversationReference> conversationReferences,
            ConversationReference conversationReferenceToCheck)
        {
            if (conversationReferences != null)
            {
                foreach (ConversationReference conversationReference in conversationReferences)
                {
                    if (Match(conversationReference, conversationReferenceToCheck))
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        #endregion Static helper methods

        /// <returns>The current global time.</returns>
        public virtual DateTime GetCurrentGlobalTime()
        {
            return (GlobalTimeProvider == null) ? DateTime.UtcNow : GlobalTimeProvider.GetCurrentTime();
        }

        #region Users and bots

        /// <returns>The users as a readonly list.</returns>
        public IList<ConversationReference> GetUsers()
        {
            return RoutingDataStore.GetUsers();
        }

        /// <returns>The bot instances as a readonly list.</returns>
        public IList<ConversationReference> GetBotInstances()
        {
            return RoutingDataStore.GetBotInstances();
        }

        /// <summary>
        /// Tries to resolve the name of the bot in the same conversation with the given
        /// conversation reference instance.
        /// </summary>
        /// <param name="conversationReference">The conversation reference from whose perspective to resolve the name.</param>
        /// <returns>The name of the bot or null, if unable to resolve.</returns>
        public virtual string ResolveBotNameInConversation(ConversationReference conversationReference)
        {
            string botName = null;

            if (conversationReference != null)
            {
                ConversationReference botConversationReference = FindConversationReference(
                        conversationReference.ChannelId, conversationReference.Conversation.Id, null, true);

                if (botConversationReference != null)
                {
                    botName = botConversationReference.Bot.Name;
                }
            }

            return botName;
        }

        /// <summary>
        /// Adds the given ConversationReference.
        /// </summary>
        /// <param name="conversationReferenceToAdd">The new ConversationReference to add.</param>
        /// <returns>The result of the operation with type:
        /// - ModifyRoutingDataResultType.Added,
        /// - ModifyRoutingDataResultType.AlreadyExists or
        /// - ModifyRoutingDataResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ModifyRoutingDataResult AddConversationReference(ConversationReference conversationReferenceToAdd)
        {
            if (conversationReferenceToAdd == null)
            {
                throw new ArgumentNullException("The given conversation reference is null");
            }

            if (conversationReferenceToAdd.Bot == null
                && conversationReferenceToAdd.User == null)
            {
                throw new ArgumentNullException("Both channel accounts in the conversation reference cannot be null");
            }

            if (IsBot(conversationReferenceToAdd)
                    ? Contains(GetBotInstances(), conversationReferenceToAdd)
                    : Contains(GetUsers(), conversationReferenceToAdd))
            {
                return new ModifyRoutingDataResult()
                {
                    Type = ModifyRoutingDataResultType.AlreadyExists
                };
            }

            if (RoutingDataStore.AddConversationReference(conversationReferenceToAdd))
            {
                _logger.Log($"{nameof(AddConversationReference)}: Adding {conversationReferenceToAdd.Conversation.Id}");
                return new ModifyRoutingDataResult()
                {
                    Type = ModifyRoutingDataResultType.Added
                };
            }

            _logger.LogError($"{nameof(AddConversationReference)}: Failed to add the conversation reference: {conversationReferenceToAdd.Conversation.Id}");
            return new ModifyRoutingDataResult()
            {
                Type = ModifyRoutingDataResultType.Error,
                ErrorMessage = "Failed to add the conversation reference"
            };
        }

        /// <summary>
        /// Removes the specified ConversationReference from all possible containers.
        /// </summary>
        /// <param name="conversationReferenceToRemove">The ConversationReference to remove.</param>
        /// <returns>A list of operation result(s).</returns>
        public virtual IList<AbstractMessageRouterResult> RemoveConversationReference(
            ConversationReference conversationReferenceToRemove)
        {
            if (conversationReferenceToRemove == null)
            {
                throw new ArgumentNullException("The given conversation reference is null");
            }

            List<AbstractMessageRouterResult> messageRouterResults = new List<AbstractMessageRouterResult>();
            bool wasRemoved = false;

            // Check users and bots
            IList<ConversationReference> conversationReferenceToSearch =
                IsBot(conversationReferenceToRemove) ? GetBotInstances() : GetUsers();

            IList<ConversationReference> conversationReferencesToRemove = FindConversationReferences(
                conversationReferenceToSearch, null, null,
                GetChannelAccount(conversationReferenceToRemove)?.Id);

            foreach (ConversationReference conversationReference in conversationReferencesToRemove)
            {
                if (RoutingDataStore.RemoveConversationReference(conversationReference))
                {
                    messageRouterResults.Add(new ModifyRoutingDataResult()
                    {
                        Type = ModifyRoutingDataResultType.Removed
                    });
                }
                else
                {
                    messageRouterResults.Add(new ModifyRoutingDataResult()
                    {
                        Type = ModifyRoutingDataResultType.Error,
                        ErrorMessage = "Failed to remove conversation reference"
                    });
                }
            }

            // Check connection requests
            wasRemoved = true;

            while (wasRemoved)
            {
                wasRemoved = false;

                foreach (ConnectionRequest connectionRequest in GetConnectionRequests())
                {
                    if (Match(conversationReferenceToRemove, connectionRequest.Requestor))
                    {
                        ConnectionRequestResult removeConnectionRequestResult =
                            RemoveConnectionRequest(connectionRequest);

                        if (removeConnectionRequestResult.Type == ConnectionRequestResultType.Rejected)
                        {
                            wasRemoved = true;
                            messageRouterResults.Add(removeConnectionRequestResult);
                            break;
                        }
                    }
                }
            }

            // Check the connections
            wasRemoved = true;

            while (wasRemoved)
            {
                wasRemoved = false;

                foreach (Connection connection in GetConnections())
                {
                    if (Match(conversationReferenceToRemove, connection.ConversationReference1)
                        || Match(conversationReferenceToRemove, connection.ConversationReference2))
                    {
                        wasRemoved = true;
                        messageRouterResults.Add(Disconnect(connection)); // TODO: Check that the disconnect was successful
                        break;
                    }
                }
            }

            return messageRouterResults;
        }

        #endregion Users and bots

        #region Aggregation channels

        /// <returns>The aggregation channels as a readonly list.</returns>
        public IList<ConversationReference> GetAggregationChannels()
        {
            return RoutingDataStore.GetAggregationChannels();
        }

        /// <summary>
        /// Checks if the given conversation reference instance is associated with aggregation.
        /// In human toung this means that the given conversation reference is, for instance,
        /// a customer service agent who deals with the customer connection requests.
        /// </summary>
        /// <param name="conversationReference">The conversation reference to check.</param>
        /// <returns>True, if is associated. False otherwise.</returns>
        public virtual bool IsAssociatedWithAggregation(ConversationReference conversationReference)
        {
            IList<ConversationReference> aggregationParties = GetAggregationChannels();

            return (conversationReference != null
                    && aggregationParties != null
                    && aggregationParties.Count > 0
                    && aggregationParties.Where(aggregationChannel =>
                        aggregationChannel.Conversation.Id.Equals(conversationReference.Conversation.Id, StringComparison.OrdinalIgnoreCase)
                        && aggregationChannel.ServiceUrl.Equals(conversationReference.ServiceUrl)
                        && aggregationChannel.ChannelId.Equals(conversationReference.ChannelId)).Any());
        }

        /// <summary>
        /// Adds the given aggregation channel.
        /// </summary>
        /// <param name="aggregationChannelToAdd">The aggregation channel to add.</param>
        /// <returns>The result of the operation with type:
        /// - ModifyRoutingDataResultType.Added,
        /// - ModifyRoutingDataResultType.AlreadyExists or
        /// - ModifyRoutingDataResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ModifyRoutingDataResult AddAggregationChannel(ConversationReference aggregationChannelToAdd)
        {
            if (aggregationChannelToAdd == null)
            {
                throw new ArgumentNullException("The given conversation reference is null");
            }

            if (GetChannelAccount(aggregationChannelToAdd) != null)
            {
                throw new ArgumentException("The conversation reference instance for an aggregation channel cannot contain a channel account");
            }

            if (string.IsNullOrWhiteSpace(aggregationChannelToAdd.ChannelId)
                || aggregationChannelToAdd.Conversation == null
                || string.IsNullOrWhiteSpace(aggregationChannelToAdd.Conversation.Id))
            {
                return new ModifyRoutingDataResult()
                {
                    Type = ModifyRoutingDataResultType.Error,
                    ErrorMessage = "Aggregation channel must contain a valid channel and conversation ID"
                };
            }

            IList<ConversationReference> aggregationParties = GetAggregationChannels();

            if (Contains(aggregationParties, aggregationChannelToAdd))
            {
                return new ModifyRoutingDataResult()
                {
                    Type = ModifyRoutingDataResultType.AlreadyExists
                };
            }

            if (RoutingDataStore.AddAggregationChannel(aggregationChannelToAdd))
            {
                return new ModifyRoutingDataResult()
                {
                    Type = ModifyRoutingDataResultType.Added
                };
            }

            return new ModifyRoutingDataResult()
            {
                Type = ModifyRoutingDataResultType.Error,
                ErrorMessage = "Failed to add the aggregation channel"
            };
        }

        /// <summary>
        /// Removes the given aggregation channel.
        /// </summary>
        /// <param name="aggregationChannelToRemove">The aggregation channel to remove.</param>
        /// <returns>True, if removed successfully. False otherwise.</returns>
        public virtual bool RemoveAggregationChannel(ConversationReference aggregationChannelToRemove)
        {
            return RoutingDataStore.RemoveAggregationChannel(aggregationChannelToRemove);
        }

        #endregion Aggregation channels

        #region Connection requests

        /// <returns>The connection requests as a readonly list.</returns>
        public IList<ConnectionRequest> GetConnectionRequests()
        {
            return RoutingDataStore.GetConnectionRequests();
        }

        /// <summary>
        /// Tries to find a connection request by the given conversation reference
        /// (associated with the requestor).
        /// </summary>
        /// <param name="conversationReference">The conversation reference associated with the requestor.</param>
        /// <returns>The connection request or null, if not found.</returns>
        public ConnectionRequest FindConnectionRequest(ConversationReference conversationReference)
        {
            foreach (ConnectionRequest connectionRequest in GetConnectionRequests())
            {
                if (Match(conversationReference, connectionRequest.Requestor))
                {
                    return connectionRequest;
                }
            }

            return null;
        }

        /// <summary>
        /// Adds the given connection request.
        /// </summary>
        /// <param name="connectionRequestToAdd">The connection request to add.</param>
        /// <param name="rejectConnectionRequestIfNoAggregationChannel">
        /// If true, will reject all requests, if there is no aggregation channel.</param>
        /// <returns>The result of the operation:
        /// - ConnectionRequestResultType.Created,
        /// - ConnectionRequestResultType.AlreadyExists,
        /// - ConnectionRequestResultType.NotSetup or
        /// - ConnectionRequestResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionRequestResult AddConnectionRequest(
            ConnectionRequest connectionRequestToAdd, bool rejectConnectionRequestIfNoAggregationChannel = false)
        {
            if (connectionRequestToAdd == null)
            {
                throw new ArgumentNullException("Connection request is null");
            }

            ConnectionRequestResult addConnectionRequestResult = new ConnectionRequestResult()
            {
                ConnectionRequest = connectionRequestToAdd
            };

            if (GetConnectionRequests().Contains(connectionRequestToAdd))
            {
                addConnectionRequestResult.Type = ConnectionRequestResultType.AlreadyExists;
            }
            else
            {
                if (!GetAggregationChannels().Any() && rejectConnectionRequestIfNoAggregationChannel)
                {
                    addConnectionRequestResult.Type = ConnectionRequestResultType.NotSetup;
                }
                else
                {
                    connectionRequestToAdd.ConnectionRequestTime = GetCurrentGlobalTime();

                    if (RoutingDataStore.AddConnectionRequest(connectionRequestToAdd))
                    {
                        addConnectionRequestResult.Type = ConnectionRequestResultType.Created;
                    }
                    else
                    {
                        addConnectionRequestResult.Type = ConnectionRequestResultType.Error;
                        addConnectionRequestResult.ErrorMessage = "Failed to add the connection request - this is likely an error caused by the storage implementation";
                    }
                }
            }

            return addConnectionRequestResult;
        }

        /// <summary>
        /// Removes the connection request of the user with the given conversation reference.
        /// </summary>
        /// <param name="connectionRequestToRemove">The connection request to remove.</param>
        /// <returns>The result of the operation:
        /// - ConnectionRequestResultType.Rejected or
        /// - ConnectionRequestResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionRequestResult RemoveConnectionRequest(ConnectionRequest connectionRequestToRemove)
        {
            if (connectionRequestToRemove == null)
            {
                throw new ArgumentNullException("Connection request is null");
            }

            ConnectionRequestResult removeConnectionRequestResult = new ConnectionRequestResult
            {
                ConnectionRequest = connectionRequestToRemove
            };

            if (GetConnectionRequests().Contains(connectionRequestToRemove))
            {
                if (RoutingDataStore.RemoveConnectionRequest(connectionRequestToRemove))
                {
                    removeConnectionRequestResult.Type = ConnectionRequestResultType.Rejected;
                }
                else
                {
                    removeConnectionRequestResult.Type = ConnectionRequestResultType.Error;
                    removeConnectionRequestResult.ErrorMessage = "Failed to remove the connection request associated with the given user";
                }
            }
            else
            {
                removeConnectionRequestResult.Type = ConnectionRequestResultType.Error;
                removeConnectionRequestResult.ErrorMessage = "Could not find a connection request associated with the given user";
            }

            return removeConnectionRequestResult;
        }

        #endregion Connection requests

        #region Connections

        /// <returns>The connections.</returns>
        public IList<Connection> GetConnections()
        {
            return RoutingDataStore.GetConnections();
        }

        /// <summary>
        /// Tries to find a connection associated with the given conversation reference.
        /// </summary>
        /// <param name="conversationReference">The conversation reference associated with the connection to find.</param>
        /// <returns>The connection or null, if not found.</returns>
        public virtual Connection FindConnection(ConversationReference conversationReference)
        {
            foreach (Connection connection in GetConnections())
            {
                if (Match(conversationReference, connection.ConversationReference1)
                    || Match(conversationReference, connection.ConversationReference2))
                {
                    return connection;
                }
            }

            return null;
        }

        /// <summary>
        /// Checks if the there is a connection associated with the given conversation reference instance.
        /// </summary>
        /// <param name="ConversationReference">The conversation reference to check.</param>
        /// <returns>True, if a connection was found. False otherwise.</returns>
        public virtual bool IsConnected(ConversationReference conversationReference)
        {
            return (FindConnection(conversationReference) != null);
        }

        /// <summary>
        /// Resolves the conversation reference sharing a connection with the given one.
        /// </summary>
        /// <param name="conversationReferenceWhoseCounterpartToFind">The conversation reference whose counterpart to resolve.</param>
        /// <returns>The counterpart or null, if not found.</returns>
        public virtual ConversationReference GetConnectedCounterpart(
            ConversationReference conversationReferenceWhoseCounterpartToFind)
        {
            foreach (Connection connection in GetConnections())
            {
                if (Match(
                        conversationReferenceWhoseCounterpartToFind, connection.ConversationReference1))
                {
                    return connection.ConversationReference2;
                }
                else if (Match(
                            conversationReferenceWhoseCounterpartToFind, connection.ConversationReference2))
                {
                    return connection.ConversationReference1;
                }
            }

            return null;
        }

        /// <summary>
        /// Adds the given connection and clears the connection request associated with the given
        /// conversation reference instance, if one exists.
        /// </summary>
        /// <param name="connectionToAdd">The connection to add.</param>
        /// <param name="requestor">The requestor.</param>
        /// <returns>The result of the operation:
        /// - ConnectionResultType.Connected,
        /// - ConnectionResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionResult ConnectAndRemoveConnectionRequest(
            Connection connectionToAdd, ConversationReference requestor)
        {
            ConnectionResult connectResult = new ConnectionResult()
            {
                Connection = connectionToAdd
            };

            connectionToAdd.TimeSinceLastActivity = GetCurrentGlobalTime();
            bool wasConnectionAdded = RoutingDataStore.AddConnection(connectionToAdd);

            if (wasConnectionAdded)
            {
                ConnectionRequest acceptedConnectionRequest = FindConnectionRequest(requestor);

                if (acceptedConnectionRequest == null)
                {
                    _logger.Log("Failed to find the connection request to remove");
                }
                else
                {
                    RemoveConnectionRequest(acceptedConnectionRequest);
                }

                connectResult.Type = ConnectionResultType.Connected;
                connectResult.ConnectionRequest = acceptedConnectionRequest;
            }
            else
            {
                connectResult.Type = ConnectionResultType.Error;
                connectResult.ErrorMessage = $"Failed to add the connection {connectionToAdd}";
            }

            return connectResult;
        }

        /// <summary>
        /// Updates the time since last activity property of the given connection instance.
        /// </summary>
        /// <param name="connection">The connection to update.</param>
        /// <returns>True, if the connection was updated successfully. False otherwise.</returns>
        public virtual bool UpdateTimeSinceLastActivity(Connection connection)
        {
            if (RoutingDataStore.RemoveConnection(connection))
            {
                connection.TimeSinceLastActivity = GetCurrentGlobalTime();
                return RoutingDataStore.AddConnection(connection);
            }

            return false;
        }

        /// <summary>
        /// Disconnects the given connection.
        /// </summary>
        /// <param name="connectionToDisconnect">The connection to disconnect.</param>
        /// <returns>The result of the operation:
        /// - ConnectionResultType.Disconnected,
        /// - ConnectionResultType.Error (see the error message for more details).
        /// </returns>
        public virtual ConnectionResult Disconnect(Connection connectionToDisconnect)
        {
            ConnectionResult disconnectResult = new ConnectionResult()
            {
                Connection = connectionToDisconnect
            };

            foreach (Connection connection in GetConnections())
            {
                if (connectionToDisconnect.Equals(connection))
                {
                    if (RoutingDataStore.RemoveConnection(connectionToDisconnect))
                    {
                        disconnectResult.Type = ConnectionResultType.Disconnected;
                    }
                    else
                    {
                        disconnectResult.Type = ConnectionResultType.Error;
                        disconnectResult.ErrorMessage = "Failed to remove the connection";
                    }

                    break;
                }
            }

            return disconnectResult;
        }

        #endregion Connections

        /// <summary>
        /// Tries to find the conversation references in the given list matching the given criteria.
        /// You can define one or more criteria, but you must define at least one.
        /// </summary>
        /// <param name="conversationReferencesToSearch">The list of conversation references to search.</param>
        /// <param name="channelId">The channel ID to match (optional).</param>
        /// <param name="conversationAccountId">The conversation account ID to match (optional).</param>
        /// <param name="channelAccountId">The channel account ID to match (optional).</param>
        /// <param name="onlyBotInstances">If true, will only look for the conversation reference instances belonging to a bot.</param>
        /// <returns>The list of matching conversation references or null, if none found.</returns>
        public virtual IList<ConversationReference> FindConversationReferences(
            IList<ConversationReference> conversationReferencesToSearch,
            string channelId = null,
            string conversationAccountId = null,
            string channelAccountId = null,
            bool onlyBotInstances = false)
        {
            if (string.IsNullOrWhiteSpace(channelId)
                && string.IsNullOrWhiteSpace(conversationAccountId)
                && string.IsNullOrWhiteSpace(channelAccountId))
            {
                throw new ArgumentNullException("At least one search criteria must be defined");
            }

            IEnumerable<ConversationReference> conversationReferencesFound = null;

            try
            {
                conversationReferencesFound = conversationReferencesToSearch.Where(conversationReference =>
                {
                    if (onlyBotInstances && !IsBot(conversationReference))
                    {
                        return false;
                    }

                    if (!string.IsNullOrWhiteSpace(channelId))
                    {
                        if (string.IsNullOrWhiteSpace(conversationReference.ChannelId)
                            || !conversationReference.ChannelId.Equals(channelId))
                        {
                            return false;
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(conversationAccountId))
                    {
                        if (conversationReference.Conversation == null
                            || string.IsNullOrWhiteSpace(conversationReference.Conversation.Id)
                            || !conversationReference.Conversation.Id.Equals(conversationAccountId))
                        {
                            return false;
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(channelAccountId))
                    {
                        ChannelAccount channelAccount = GetChannelAccount(conversationReference);

                        if (channelAccount == null
                            || string.IsNullOrWhiteSpace(channelAccount.Id)
                            || !channelAccount.Id.Equals(channelAccountId))
                        {
                            return false;
                        }
                    }

                    return true;
                });
            }
            catch (ArgumentNullException e)
            {
                _logger.Log($"Failed to search conversation references: {e.Message}");
            }
            catch (InvalidOperationException e)
            {
                _logger.Log($"Failed to search conversation references: {e.Message}");
            }

            return conversationReferencesFound?.ToArray();
        }

        /// <summary>
        /// Tries to find the conversation references in all the collections including connection
        /// requests and connections.
        ///
        /// You can define one or more criteria, but you must define at least one.
        /// </summary>
        /// <param name="channelId">The channel ID to match (optional).</param>
        /// <param name="conversationAccountId">The conversation account ID to match (optional).</param>
        /// <param name="channelAccountId">The channel account ID to match (optional).</param>
        /// <param name="onlyBotInstances">If true, will only look for the conversation reference instances belonging to a bot.</param>
        /// <returns>The conversation reference instance matching the given search criteria or null, if not found.</returns>
        public virtual ConversationReference FindConversationReference(
            string channelId = null,
            string conversationAccountId = null,
            string channelAccountId = null,
            bool onlyBotInstances = false)
        {
            List<ConversationReference> conversationReferencesToSearch =
                new List<ConversationReference>();

            if (!onlyBotInstances)
            {
                // Users
                conversationReferencesToSearch.AddRange(GetUsers());
            }

            conversationReferencesToSearch.AddRange(GetBotInstances()); // Bots

            IList<ConversationReference> conversationReferencesFound = FindConversationReferences(
                    conversationReferencesToSearch,
                    channelId, conversationAccountId, channelAccountId, onlyBotInstances);

            if (conversationReferencesFound == null || conversationReferencesFound.Count == 0)
            {
                conversationReferencesToSearch.Clear();

                // Connection requests
                foreach (ConnectionRequest connectionRequest in GetConnectionRequests())
                {
                    conversationReferencesToSearch.Add(connectionRequest.Requestor);
                }

                conversationReferencesFound = FindConversationReferences(
                    conversationReferencesToSearch,
                    channelId, conversationAccountId, channelAccountId, onlyBotInstances);
            }

            if (conversationReferencesFound == null || conversationReferencesFound.Count == 0)
            {
                conversationReferencesToSearch.Clear();

                // Connections
                foreach (Connection connection in GetConnections())
                {
                    conversationReferencesToSearch.Add(connection.ConversationReference1);
                    conversationReferencesToSearch.Add(connection.ConversationReference2);
                }

                conversationReferencesFound = FindConversationReferences(
                    conversationReferencesToSearch,
                    channelId, conversationAccountId, channelAccountId, onlyBotInstances);
            }

            if (conversationReferencesFound != null && conversationReferencesFound.Count > 0)
            {
                return conversationReferencesFound[0];
            }

            return null;
        }

        /// <summary>
        /// Tries to find the bot instance that can reach the recipient.
        /// This means that the bot instance, if found, is in the same channel and the conversation
        /// as the recipient.
        /// </summary>
        /// <param name="recipient">The recipient.</param>
        /// <returns>The bot instance or null, if not found.</returns>
        public ConversationReference FindBotInstanceForRecipient(ConversationReference recipient)
        {
            if (recipient == null)
            {
                throw new ArgumentNullException("The given conversation reference is null");
            }

            return FindConversationReference(
                recipient.ChannelId, recipient.Conversation?.Id, null, true);
        }
    }
}