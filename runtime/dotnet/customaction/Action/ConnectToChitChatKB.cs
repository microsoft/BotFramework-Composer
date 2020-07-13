using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using AdaptiveExpressions.Properties;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.AI.QnA;
using Microsoft.Bot.Builder.AI.QnA.Dialogs;
using Microsoft.Bot.Builder.AI.QnA.Utils;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Input;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Microsoft.BotFramework.Composer.CustomAction
{
    /// <summary>
    /// Custom command which takes takes 2 data bound arguments (arg1 and arg2) and multiplies them returning that as a databound result.
    /// </summary>
    public class ConnectToChitChatKB : QnAMakerDialog
    {
        new public const string Kind = "ConnectToChitChatKB";

        [JsonConstructor]
        public ConnectToChitChatKB([CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0) : base(sourceFilePath, sourceLineNumber)
        {
        }

        public ConnectToChitChatKB(string knowledgeBaseId, string endpointKey, string hostName, Activity noAnswer = null, float threshold = 0.3F, string activeLearningCardTitle = "Did you mean:", string cardNoMatchText = "None of the above.", int top = 3, Activity cardNoMatchResponse = null, Metadata[] strictFilters = null, HttpClient httpClient = null, [CallerFilePath] string sourceFilePath = "", [CallerLineNumber] int sourceLineNumber = 0) : base(knowledgeBaseId, endpointKey, hostName, noAnswer, threshold, activeLearningCardTitle, cardNoMatchText, top, cardNoMatchResponse, strictFilters, httpClient, sourceFilePath, sourceLineNumber)
        {
        }

        protected override async Task<IQnAMakerClient> GetQnAMakerClientAsync(DialogContext dc)
        {
            var qnaClient = dc.Context.TurnState.Get<IQnAMakerClient>();
            if (qnaClient != null)
            {
                // return mock client
                return qnaClient;
            }

            var configuration = dc.Context.TurnState.Get<IConfiguration>();
            var endpoint = new QnAMakerEndpoint
            {
                EndpointKey = configuration.GetValue<string>("qna:endpointkey"),
                Host = configuration.GetValue<string>("qna:hostname"),
                KnowledgeBaseId = configuration.GetValue<string>("qna:chitchat:kbId")
            };
            var options = await GetQnAMakerOptionsAsync(dc).ConfigureAwait(false);
            return new QnAMaker(endpoint, options, HttpClient, this.TelemetryClient, this.LogPersonalInformation.GetValue(dc.State));
        }

    }
}
