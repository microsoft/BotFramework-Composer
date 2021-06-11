using System;

namespace Underscore.Bot.MessageRouting.Results
{
    [Serializable]
    public abstract class AbstractMessageRouterResult
    {
        public string ErrorMessage
        {
            get;
            set;
        }

        public AbstractMessageRouterResult()
        {
            ErrorMessage = string.Empty;
        }

        public abstract string ToJson();
    }
}