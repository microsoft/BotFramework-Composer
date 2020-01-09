using System;
using Microsoft.Bot.Builder.Dialogs.Declarative.Loaders;
using Microsoft.Bot.Builder.Integration.AspNet.Core.Skills;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class BeginSkillLoader : ICustomDeserializer
    {
        private readonly SkillHttpClient skillHttpClient;

        private readonly ConversationState conversationState;

        private readonly string appId;

        private readonly string skillHostEndpoint;

        public BeginSkillLoader(SkillHttpClient httpClient, ConversationState conversationState, string appId, string skillHostEndpoint)
        {
            this.skillHttpClient = httpClient;
            this.conversationState = conversationState;
            this.appId = appId;
            this.skillHostEndpoint = skillHostEndpoint;
        }

        public object Load(JToken obj, JsonSerializer serializer, Type type)
        {
            var originalObject = obj.ToObject<BeginSkill>(serializer);
            originalObject.SetHttpClient(this.skillHttpClient);
            originalObject.SetConversationState(this.conversationState);
            originalObject.SetAppId(this.appId);
            originalObject.SetSkillHostEndpoint(this.skillHostEndpoint);
            return originalObject;
        }
    }
}
