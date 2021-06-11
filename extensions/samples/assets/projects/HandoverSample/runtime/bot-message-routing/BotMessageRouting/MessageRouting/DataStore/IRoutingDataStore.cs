using Microsoft.Bot.Schema;
using System.Collections.Generic;
using Underscore.Bot.MessageRouting.Models;

namespace Underscore.Bot.MessageRouting.DataStore
{
    public interface IRoutingDataStore
    {
        /// <returns>The users as a readonly list.</returns>
        IList<ConversationReference> GetUsers();

        /// <returns>The bot instances as a readonly list.</returns>
        IList<ConversationReference> GetBotInstances();

        /// <summary>
        /// Adds the given conversation reference instance to the collection.
        /// </summary>
        /// <param name="conversationReferenceToAdd">The new conversation reference instance to add.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool AddConversationReference(ConversationReference conversationReferenceToAdd);

        /// <summary>
        /// Removes the given conversation reference from the collection.
        /// </summary>
        /// <param name="conversationReferenceToRemove">The conversation reference to remove.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool RemoveConversationReference(ConversationReference conversationReferenceToRemove);

        /// <returns>The aggregation channels as a readonly list.</returns>
        IList<ConversationReference> GetAggregationChannels();

        /// <summary>
        /// Adds the given aggregation channel to the collection.
        /// </summary>
        /// <param name="aggregationChannelToAdd">The aggregation channel to add.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool AddAggregationChannel(ConversationReference aggregationChannelToAdd);

        /// <summary>
        /// Removes the given aggregation channel from the collection.
        /// </summary>
        /// <param name="aggregationChannelToRemove">The aggregation channel to remove.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool RemoveAggregationChannel(ConversationReference aggregationChannelToRemove);

        /// <returns>The connection requests as a readonly list.</returns>
        IList<ConnectionRequest> GetConnectionRequests();

        /// <summary>
        /// Adds the given connection request.
        /// </summary>
        /// <param name="connectionRequest">The connection request to add.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool AddConnectionRequest(ConnectionRequest connectionRequest);

        /// <summary>
        /// Removes the given connection request.
        /// </summary>
        /// <param name="connectionRequest">The connection request to remove.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool RemoveConnectionRequest(ConnectionRequest connectionRequest);

        /// <returns>The connections.</returns>
        IList<Connection> GetConnections();

        /// <summary>
        /// Adds the given connection.
        /// </summary>
        /// <param name="connection">The connection to add.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool AddConnection(Connection connectionToAdd);

        /// <summary>
        /// Removes the given connection.
        /// </summary>
        /// <param name="connection">The connection to remove.</param>
        /// <returns>True, if successful. False otherwise.</returns>
        bool RemoveConnection(Connection connectionToRemove);
    }
}