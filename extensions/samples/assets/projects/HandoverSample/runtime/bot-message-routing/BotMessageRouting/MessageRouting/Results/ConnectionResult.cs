using Microsoft.Bot.Schema;
using Newtonsoft.Json;
using System;
using Underscore.Bot.MessageRouting.Models;

namespace Underscore.Bot.MessageRouting.Results
{
    /// <summary>
    /// The connection result type:
    /// - Connected: A new connection was successfully established,
    /// - Disconnected: The existing connection was disconnected,
    /// - Error: Generic error, see the error message.
    /// </summary>
    public enum ConnectionResultType
    {
        Connected,
        Disconnected,
        Error
    }

    [Serializable]
    public class ConnectionResult : AbstractMessageRouterResult
    {
        public ConnectionResultType Type
        {
            get;
            set;
        }

        /// <summary>
        /// The connection associated with this result.
        /// </summary>
        public Connection Connection
        {
            get;
            set;
        }

        /// <summary>
        /// The connection request, which was accepted, associated with this result.
        /// </summary>
        public ConnectionRequest ConnectionRequest
        {
            get;
            set;
        }

        /// <summary>
        /// A valid conversation resource response instance of the newly created direct conversation
        /// (between the bot [who will relay messages] and the user, who accepted the request),
        /// when a new connection was established successfully.
        /// </summary>
        public ConversationResourceResponse ConversationResourceResponse
        {
            get;
            set;
        }

        public ConnectionResult() : base()
        {
        }

        public static ConnectionResult FromJson(string resultAsJsonString)
        {
            ConnectionResult connectionResult = null;

            try
            {
                connectionResult =
                    JsonConvert.DeserializeObject<ConnectionResult>(resultAsJsonString);
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to deserialize from JSON: {e.Message}");
            }

            return connectionResult;
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