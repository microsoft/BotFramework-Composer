using Microsoft.WindowsAzure.Storage.Table;

namespace Underscore.Bot.MessageRouting.Models.Azure
{
    public class RoutingDataEntity : TableEntity
    {
        public string Body { get; set; }
    }
}