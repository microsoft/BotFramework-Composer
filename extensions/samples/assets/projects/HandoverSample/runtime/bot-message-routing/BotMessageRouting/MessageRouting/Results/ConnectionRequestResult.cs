using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using System;
using Underscore.Bot.MessageRouting.Models;

namespace Underscore.Bot.MessageRouting.Results
{
    /// <summary>
    /// The connection request result type:
    /// - Created: Connection request successfully created and added into the data store,
    /// - AlreadyExists: A connection request for the requestor already exists,
    /// - NotSetup: No aggregation channel or portal available (no-one to accept/reject the request),
    /// - Rejected: The request was rejected,
    /// - Error: Generic error, see the error message.
    ///
    /// Note: Accepted requests are provided with connection result instead of this class.
    /// </summary>
    public enum ConnectionRequestResultType
    {
        Created = 0,
        AlreadyExists,
        NotSetup,
        Rejected,
        Error
    };

    [Serializable]
    public class ConnectionRequestResult : AbstractMessageRouterResult
    {
        public ConnectionRequestResultType Type
        {
            get;
            set;
        }

        /// <summary>
        /// The connection request associated with this result.
        /// </summary>
        public ConnectionRequest ConnectionRequest
        {
            get;
            set;
        }

        /// <summary>
        /// If this result of type 'Rejected', this property can contain the user,
        /// who rejected the request.
        /// </summary>
        public ConversationReference Rejecter
        {
            get;
            set;
        }

        public ConnectionRequestResult() : base()
        {
        }

        public static ConnectionRequestResult FromJson(string resultAsJsonString)
        {
            ConnectionRequestResult connectionRequestResult = null;

            try
            {
                connectionRequestResult =
                    JsonConvert.DeserializeObject<ConnectionRequestResult>(resultAsJsonString);
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to deserialize from JSON: {e.Message}");
            }

            return connectionRequestResult;
        }

        public override string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }

        public override string ToString()
        {
            return ToJson();
        }
    }
}