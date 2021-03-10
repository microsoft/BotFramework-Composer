using Newtonsoft.Json;
using System;
using System.Text;
using Underscore.Bot.MessageRouting.Models;

namespace Underscore.Bot.MessageRouting.Results
{
    /// <summary>
    /// The message routing result type:
    /// - NoActionTaken: Nothing needed to be done - The result handler should ignore results with this type,
    /// - MessageRouted: The message was routed successfully,
    /// - FailedToRouteMessage: Failed to route the message, see the error message for more information,
    /// - Error: Generic error, see the error message.
    /// </summary>
    public enum MessageRoutingResultType
    {
        NoActionTaken = 0,
        MessageRouted,
        FailedToRouteMessage,
        Error
    }

    [Serializable]
    public class MessageRoutingResult : AbstractMessageRouterResult
    {
        public MessageRoutingResultType Type
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

        public MessageRoutingResult() : base()
        {
        }

        public static MessageRoutingResult FromJson(string resultAsJsonString)
        {
            MessageRoutingResult messageRoutingResult = null;

            try
            {
                messageRoutingResult =
                    JsonConvert.DeserializeObject<MessageRoutingResult>(resultAsJsonString);
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to deserialize from JSON: {e.Message}");
            }

            return messageRoutingResult;
        }

        public override string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }

        public override string ToString()
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.Append(Type);
            stringBuilder.Append("; ");

            if (Connection != null)
            {
                stringBuilder.Append("Connection: ");
                stringBuilder.Append(Connection.ToString());
                stringBuilder.Append(";");
            }

            if (!string.IsNullOrEmpty(ErrorMessage))
            {
                stringBuilder.Append("; Error message: \"");
                stringBuilder.Append(ErrorMessage);
                stringBuilder.Append("\"");
            }

            return stringBuilder.ToString();
        }
    }
}