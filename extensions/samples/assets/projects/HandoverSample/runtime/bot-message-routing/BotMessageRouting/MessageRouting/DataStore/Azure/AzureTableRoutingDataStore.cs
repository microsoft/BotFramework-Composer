using Microsoft.Bot.Schema;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Underscore.Bot.MessageRouting.Logging;
using Underscore.Bot.MessageRouting.Models;
using Underscore.Bot.MessageRouting.Models.Azure;

namespace Underscore.Bot.MessageRouting.DataStore.Azure
{
    /// <summary>
    /// Routing data store that stores the data in Azure Table Storage.
    /// See the IRoutingDataStore interface for the general documentation of properties and methods.
    /// </summary>
    [Serializable]
    public class AzureTableRoutingDataStore : IRoutingDataStore
    {
        protected const string DefaultPartitionKey = "BotMessageRouting";
        protected const string TableNameBotInstances = "BotInstances";
        protected const string TableNameUsers = "Users";
        protected const string TableNameAggregationChannels = "AggregationChannels";
        protected const string TableNameConnectionRequests = "ConnectionRequests";
        protected const string TableNameConnections = "Connections";
        protected readonly ILogger _logger;
        protected CloudTable _botInstancesTable;
        protected CloudTable _usersTable;
        protected CloudTable _aggregationChannelsTable;
        protected CloudTable _connectionRequestsTable;
        protected CloudTable _connectionsTable;

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="connectionString">The connection string associated with an Azure Table Storage.</param>
        public AzureTableRoutingDataStore(string connectionString, ILogger logger)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new ArgumentNullException("The connection string cannot be null or empty");
            }

            _logger = logger;
            
            _botInstancesTable = AzureStorageHelper.GetTable(connectionString, TableNameBotInstances);
            _usersTable = AzureStorageHelper.GetTable(connectionString, TableNameUsers);
            _aggregationChannelsTable = AzureStorageHelper.GetTable(connectionString, TableNameAggregationChannels);
            _connectionRequestsTable = AzureStorageHelper.GetTable(connectionString, TableNameConnectionRequests);
            _connectionsTable = AzureStorageHelper.GetTable(connectionString, TableNameConnections);

            MakeSureTablesExistAsync();
        }

        #region Get region

        public IList<ConversationReference> GetUsers()
        {
            var entities = GetAllEntitiesFromTable(_usersTable).Result;
            return GetAllConversationReferencesFromEntities(entities);
        }

        public IList<ConversationReference> GetBotInstances()
        {
            var entities = GetAllEntitiesFromTable(_botInstancesTable).Result;
            return GetAllConversationReferencesFromEntities(entities);
        }

        public IList<ConversationReference> GetAggregationChannels()
        {
            var entities = GetAllEntitiesFromTable(_aggregationChannelsTable).Result;
            return GetAllConversationReferencesFromEntities(entities);
        }

        public IList<ConnectionRequest> GetConnectionRequests()
        {
            var entities = GetAllEntitiesFromTable(_connectionRequestsTable).Result;
            var connectionRequests = new List<ConnectionRequest>();

            foreach (RoutingDataEntity entity in entities)
            {
                var connectionRequest =
                    JsonConvert.DeserializeObject<ConnectionRequest>(entity.Body);
                connectionRequests.Add(connectionRequest);
            }

            return connectionRequests;
        }

        public IList<Connection> GetConnections()
        {
            var entities = GetAllEntitiesFromTable(_connectionsTable).Result;
            var connections = new List<Connection>();

            foreach (RoutingDataEntity entity in entities)
            {
                var connection =
                    JsonConvert.DeserializeObject<Connection>(entity.Body);
                connections.Add(connection);
            }

            return connections;
        }

        #endregion Get region

        #region Add region

        public bool AddConversationReference(ConversationReference conversationReference)
        {
            CloudTable table = null;

            if (conversationReference.Bot != null)
            {
                table = _botInstancesTable;
            }
            else
            {
                table = _usersTable;
            }

            string rowKey = conversationReference.Conversation.Id;
            string body = JsonConvert.SerializeObject(conversationReference);

            return InsertEntityToTable(rowKey, body, table);
        }

        public bool AddAggregationChannel(ConversationReference aggregationChannel)
        {
            string rowKey = aggregationChannel.Conversation.Id;
            string body = JsonConvert.SerializeObject(aggregationChannel);

            return InsertEntityToTable(rowKey, body, _aggregationChannelsTable);
        }

        public bool AddConnectionRequest(ConnectionRequest connectionRequest)
        {
            string rowKey = connectionRequest.Requestor.Conversation.Id;
            string body = JsonConvert.SerializeObject(connectionRequest);

            return InsertEntityToTable(rowKey, body, _connectionRequestsTable);
        }

        public bool AddConnection(Connection connection)
        {
            string rowKey = connection.ConversationReference1.Conversation.Id +
                connection.ConversationReference2.Conversation.Id;
            string body = JsonConvert.SerializeObject(connection);

            return InsertEntityToTable(rowKey, body, _connectionsTable);
        }

        #endregion Add region

        #region Remove region

        public bool RemoveConversationReference(ConversationReference conversationReference)
        {
            CloudTable table = null;

            if (conversationReference.Bot != null)
            {
                table = _botInstancesTable;
            }
            else
            {
                table = _usersTable;
            }

            string rowKey = conversationReference.Conversation.Id;
            return AzureStorageHelper.DeleteEntryAsync<RoutingDataEntity>(
                table, DefaultPartitionKey, rowKey).Result;
        }

        public bool RemoveAggregationChannel(ConversationReference aggregationChannel)
        {
            string rowKey = aggregationChannel.Conversation.Id;
            return AzureStorageHelper.DeleteEntryAsync<RoutingDataEntity>(
                _aggregationChannelsTable, DefaultPartitionKey, rowKey).Result;
        }

        public bool RemoveConnectionRequest(ConnectionRequest connectionRequest)
        {
            string rowKey = connectionRequest.Requestor.Conversation.Id;
            return AzureStorageHelper.DeleteEntryAsync<RoutingDataEntity>(
                _connectionRequestsTable, DefaultPartitionKey, rowKey).Result;
        }

        public bool RemoveConnection(Connection connection)
        {
            string rowKey = connection.ConversationReference1.Conversation.Id +
                connection.ConversationReference2.Conversation.Id;
            return AzureStorageHelper.DeleteEntryAsync<RoutingDataEntity>(
                _connectionsTable, DefaultPartitionKey, rowKey).Result;
        }

        #endregion Remove region

        #region Validators and helpers

        /// <summary>
        /// Makes sure the required tables exist.
        /// </summary>
        protected virtual async void MakeSureTablesExistAsync()
        {
            CloudTable[] cloudTables =
            {
                _botInstancesTable,
                _usersTable,
                _aggregationChannelsTable,
                _connectionRequestsTable,
                _connectionsTable
            };

            foreach (CloudTable cloudTable in cloudTables)
            {
                try
                {
                    await cloudTable.CreateIfNotExistsAsync();
                    _logger.LogInformation($"Table '{cloudTable.Name}' created or did already exist");
                }
                catch (StorageException e)
                {
                    _logger.LogError($"Failed to create table '{cloudTable.Name}' (perhaps it already exists): {e.Message}");
                }
            }
        }

        private List<ConversationReference> GetAllConversationReferencesFromEntities(IList<RoutingDataEntity> entities)
        {
            var conversationReferences = new List<ConversationReference>();

            foreach (RoutingDataEntity entity in entities)
            {
                var conversationReference =
                    JsonConvert.DeserializeObject<ConversationReference>(entity.Body);
                conversationReferences.Add(conversationReference);
            }

            return conversationReferences;
        }

        private async Task<IList<RoutingDataEntity>> GetAllEntitiesFromTable(CloudTable table)
        {
            var query = new TableQuery<RoutingDataEntity>()
                .Where(TableQuery.GenerateFilterCondition(
                    "PartitionKey", QueryComparisons.Equal, DefaultPartitionKey));

            return await table.ExecuteTableQueryAsync(query);
        }

        private static bool InsertEntityToTable(string rowKey, string body, CloudTable table)
        {
            return AzureStorageHelper.InsertAsync<RoutingDataEntity>(table,
                new RoutingDataEntity()
                {
                    Body = body,
                    PartitionKey = DefaultPartitionKey,
                    RowKey = rowKey
                }).Result;
        }

        #endregion Validators and helpers
    }
}