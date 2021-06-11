using Microsoft.WindowsAzure.Storage.Table;

namespace Underscore.Bot.MessageRouting.Models.Azure
{
    /// <summary>
    /// Table storage entity that represents a 1:1 connection (conversation).
    /// </summary>
    public class ConnectionEntity : TableEntity
    {
        public string Owner { get; set; }
        public string Client { get; set; }

        public ConnectionEntity()
        {
        }

        public ConnectionEntity(string partitionKey, string rowKey)
        {
            PartitionKey = partitionKey;
            RowKey = rowKey;
        }
    }
}