using Newtonsoft.Json;

namespace Underscore.Bot.MessageRouting.Results
{
    public enum ModifyRoutingDataResultType
    {
        Added,
        AlreadyExists,
        Removed,
        Error
    }

    public class ModifyRoutingDataResult : AbstractMessageRouterResult
    {
        public ModifyRoutingDataResultType Type
        {
            get;
            set;
        }

        public override string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}