using System;
using Microsoft.Bot.Builder.Dialogs.Declarative.Loaders;
using Microsoft.Bot.Builder.Integration.AspNet.Core.Skills;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class BeginSkillLoader : ICustomDeserializer
    {
        private SkillHttpClient skillHttpClient;

        private ConversationState conversationState;

        private string appId;

        public BeginSkillLoader(SkillHttpClient httpClient, ConversationState conversationState, string appId)
        {
            this.skillHttpClient = httpClient;
            this.conversationState = conversationState;
            this.appId = appId;
        }

        public object Load(JToken obj, JsonSerializer serializer, Type type)
        {
            var orignalObject = obj.ToObject<BeginSkill>(serializer);
            orignalObject.SetHttpClient(this.skillHttpClient);
            orignalObject.SetConversationState(this.conversationState);
            orignalObject.SetAppId(this.appId);

            return orignalObject;
        }
    }
}
