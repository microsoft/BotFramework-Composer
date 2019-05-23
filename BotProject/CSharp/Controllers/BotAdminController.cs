// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EchoBot v4.3.0

using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs.Debugging;
using Microsoft.Bot.Builder.Integration.AspNet.Core;

namespace Microsoft.Bot.Builder.TestBot.Json
{
    [Route("api/admin")]
    [ApiController]
    public class BotAdminController : ControllerBase
    {
        private readonly IBotManager BotManager;

        public BotAdminController(IBotManager botManager)
        {
            BotManager = botManager;
        }

        [HttpPost]
        public async Task<string> PostAsync()
        {
            var botProj = BotProject.Load("../../SampleBots/04 - TextInput/bot.botproj");
            BotManager.SetCurrent(botProj);
            return await Task.FromResult("OK");
        }

        
    }
}
