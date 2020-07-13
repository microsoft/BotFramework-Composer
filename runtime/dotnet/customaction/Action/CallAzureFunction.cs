using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using AdaptiveExpressions;
using AdaptiveExpressions.Properties;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.AI.QnA;
using Microsoft.Bot.Builder.AI.QnA.Dialogs;
using Microsoft.Bot.Builder.AI.QnA.Utils;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Actions;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Input;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Microsoft.BotFramework.Composer.CustomAction
{
    /// <summary>
    /// Custom command which takes takes 2 data bound arguments (arg1 and arg2) and multiplies them returning that as a databound result.
    /// </summary>
    public class CallAzureFunction : HttpRequest
    {
        new public const string Kind = "CallAzureFunction";

        [JsonConstructor]
        public CallAzureFunction([CallerFilePath] string callerPath = "", [CallerLineNumber] int callerLine = 0) : base(callerPath, callerLine)
        {
        }

        public CallAzureFunction(HttpMethod method, string url, Dictionary<string, StringExpression> headers = null, object body = null, [CallerFilePath] string callerPath = "", [CallerLineNumber] int callerLine = 0) : base(method, url, headers, body, callerPath, callerLine)
        {
        }

        public override async Task<DialogTurnResult> BeginDialogAsync(DialogContext dc, object options = null, CancellationToken cancellationToken = default)
        {
            if (Headers == null)
            {
                Headers = new Dictionary<string, StringExpression>();
            }
            if (!Headers.ContainsKey("Authorization"))
            {
                Headers.Add("Authorization", new StringExpression($"Bearer {await GetAzureTokenAsync(new Uri(this.Url.GetValue(dc)))}"));
            }

            return await base.BeginDialogAsync(dc, options, cancellationToken);
        }

        private async Task<string> GetAzureTokenAsync(Uri uri)
        {
            AzureServiceTokenProvider azureTokenProvider = new AzureServiceTokenProvider();
            string tokenPayload = await azureTokenProvider.GetAccessTokenAsync($"{uri.Scheme}://{uri.Host}");
            return tokenPayload;
        }
    }
}
