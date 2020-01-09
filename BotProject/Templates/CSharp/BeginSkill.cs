using System;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Integration.AspNet.Core.Skills;
using Microsoft.Bot.Builder.Skills;
using Microsoft.Bot.Schema;
using Newtonsoft.Json;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public class BeginSkill : Dialog
    {
        [JsonProperty("$kind")]
        public const string DeclarativeType = "Microsoft.BeginSkill";

        private ConversationState _conversationState;

        private SkillHttpClient _skillClient;

        private BotFrameworkSkill _activeSkill;

        private string _skillHostEndpoint;

        private string _appId;

        public BeginSkill([CallerFilePath] string callerPath = "", [CallerLineNumber] int callerLine = 0)
            : base()
        {
            this.RegisterSourceLocation(callerPath, callerLine);
        }

        [JsonProperty("targetSkill")]
        public BotFrameworkSkill TargetSkill { get; set; }

        public void SetHttpClient(SkillHttpClient skillHttpClient)
        {
            this._skillClient = skillHttpClient;
        }

        public void SetConversationState(ConversationState conversationState)
        {
            this._conversationState = conversationState;
        }

        public void SetAppId(string appId)
        {
            this._appId = appId;
        }

        public void SetSkillHostEndpoint(string skillHostEndpoint)
        {
            this._skillHostEndpoint = skillHostEndpoint;
        }

        public override async Task<DialogTurnResult> BeginDialogAsync(DialogContext dc, object options = null, CancellationToken cancellationToken = default)
        {
            // If receive end conversation activity then end this action and continue with others
            if (dc.Context.Activity.Type == ActivityTypes.EndOfConversation)
            {
                return await dc.EndDialogAsync(dc.Context.Activity.Value, cancellationToken);
            }

            // Try to get the active skill
            this._activeSkill = TargetSkill;

            if (this._activeSkill != null)
            {
                // Send the activity to the skill
                await SendToSkill(dc, _activeSkill, cancellationToken);
            }

            await _conversationState.SaveChangesAsync(dc.Context, force: true, cancellationToken: cancellationToken);

            // for now we don't know whether the child skill will be ended, so we suppose it won't
            return Dialog.EndOfTurn;
        }

        public override async Task<DialogTurnResult> ContinueDialogAsync(DialogContext dc, CancellationToken cancellationToken = default)
        {
            // If receive end conversation activity then end this action and continue with others
            if (dc.Context.Activity.Type == ActivityTypes.EndOfConversation)
            {
                return await dc.EndDialogAsync(dc.Context.Activity.Value, cancellationToken);
            }

            if (this._activeSkill != null)
            {
                // Send the activity to the skill
                await SendToSkill(dc, _activeSkill, cancellationToken);
            }

            await _conversationState.SaveChangesAsync(dc.Context, force: true, cancellationToken: cancellationToken);

            // for now we don't know whether the child skill will be ended, so we suppose it won't
            return Dialog.EndOfTurn;
        }

        private async Task SendToSkill(DialogContext dc, BotFrameworkSkill targetSkill, CancellationToken cancellationToken)
        {
            await _conversationState.SaveChangesAsync(dc.Context, force: true, cancellationToken: cancellationToken);

            var response = await _skillClient.PostActivityAsync(this._appId, targetSkill, new Uri(_skillHostEndpoint), dc.Context.Activity, cancellationToken);

            if (!(response.Status >= 200 && response.Status <= 299))
            {
                throw new HttpRequestException($"Error invoking the skill id: \"{targetSkill.Id}\" at \"{targetSkill.SkillEndpoint}\" (status is {response.Status}). \r\n {response.Body}");
            }
        }
    }
}
