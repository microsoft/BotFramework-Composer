using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Underscore.Bot.MessageRouting.DataStore.Azure
{
    /// <summary>
    /// Contains Azure table storage utility methods.
    /// </summary>
    public static class AzureStorageHelper
    {
        /// <summary>
        /// Tries to resolve a table in the storage defined by the given connection string and table name.
        /// </summary>
        /// <param name="connectionString">The Azure storage connection string.</param>
        /// <param name="tableName">The name of the table to resolve and return.</param>
        /// <returns>The resolved table or null in case of an error.</returns>
        /// <exception cref="ArgumentException"></exception>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="FormatException"></exception>
        public static CloudTable GetTable(string connectionString, string tableName)
        {
            CloudStorageAccount cloudStorageAccount = null;

            try
            {
                cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
            }
            catch
            {
                throw;
            }

            CloudTableClient cloudTableClient = cloudStorageAccount?.CreateCloudTableClient();
            return cloudTableClient?.GetTableReference(tableName);
        }

        /// <summary>
        /// Tries to insert the given entry into the given table.
        /// </summary>
        /// <typeparam name="T">TableEntity derivative.</typeparam>
        /// <param name="cloudTable">The destination table.</param>
        /// <param name="entryToInsert">The entry to insert into the table.</param>
        /// <returns>True, if the given entry was inserted successfully. False otherwise.</returns>
        public static async Task<bool> ReplaceAsync<T>(CloudTable cloudTable, T entryToInsert) where T : ITableEntity
        {
            TableOperation replaceOperation = TableOperation.InsertOrReplace(entryToInsert);
            TableResult replaceResult = null;

            try
            {
                replaceResult = await cloudTable.ExecuteAsync(replaceOperation);
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to replace the given entity into table '{cloudTable.Name}': {e.Message}");
                return false;
            }

            return (replaceResult?.Result != null);
        }

        /// <summary>
        /// Tries to insert the given entry into the given table.
        /// </summary>
        /// <typeparam name="T">TableEntity derivative.</typeparam>
        /// <param name="cloudTable">The destination table.</param>
        /// <param name="entryToInsert">The entry to insert into the table.</param>
        /// <returns>True, if the given entry was inserted successfully. False otherwise.</returns>
        public static async Task<bool> InsertAsync<T>(CloudTable cloudTable, T entryToInsert) where T : ITableEntity
        {
            TableOperation insertOperation = TableOperation.Insert(entryToInsert);
            TableResult insertResult = null;

            try
            {
                insertResult = await cloudTable.ExecuteAsync(insertOperation);
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to insert the given entity into table '{cloudTable.Name}': {e.Message}");
                return false;
            }

            return (insertResult?.Result != null);
        }

        /// <summary>
        /// Deletes an entry from the given table by the given partition and row key.
        /// </summary>
        /// <typeparam name="T">TableEntity derivative.</typeparam>
        /// <param name="partitionKey">The partition key.</param>
        /// <param name="rowKey">The row key.</param>
        /// <returns>True, if an entry (entity) was deleted. False otherwise.</returns>
        public static async Task<bool> DeleteEntryAsync<T>(
            CloudTable cloudTable, string partitionKey, string rowKey) where T : ITableEntity
        {
            TableOperation retrieveOperation = TableOperation.Retrieve<T>(partitionKey, rowKey);
            TableResult retrieveResult = await cloudTable.ExecuteAsync(retrieveOperation);

            if (retrieveResult.Result is T entityToDelete)
            {
                TableOperation deleteOperation = TableOperation.Delete(entityToDelete);
                await cloudTable.ExecuteAsync(deleteOperation);
                return true;
            }

            return false;
        }

        /// <summary>
        /// A utility method for executing table queries.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cloudTable">The table.</param>
        /// <param name="tableQuery">The table query to execute.</param>
        /// <param name="cancellationToken"></param>
        /// <param name="onProgress"></param>
        /// <returns>The resulting list of items.</returns>
        public static async Task<IList<T>> ExecuteTableQueryAsync<T>(
            this CloudTable cloudTable, TableQuery<T> tableQuery,
            CancellationToken cancellationToken = default(CancellationToken),
            Action<IList<T>> onProgress = null) where T : ITableEntity, new()
        {
            var items = new List<T>();
            TableContinuationToken tableContinuationToken = null;

            do
            {
                TableQuerySegment<T> tableQuerySegment = null;

                try
                {
                    tableQuerySegment = await cloudTable.ExecuteQuerySegmentedAsync<T>(tableQuery, tableContinuationToken);
                }
                catch (Exception e)
                {
                    System.Diagnostics.Debug.WriteLine($"Failed to execute a table query: {e.Message}");
                    return items;
                }

                tableContinuationToken = tableQuerySegment.ContinuationToken;
                items.AddRange(tableQuerySegment);
                onProgress?.Invoke(items);
            }
            while (tableContinuationToken != null && !cancellationToken.IsCancellationRequested);

            return items;
        }
    }
}