// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EchoBot v4.3.0

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Microsoft.Bot.Builder.ComposerBot.json
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

        [HttpGet] 
        public IActionResult GetAsync()
        {
            return Ok();
        }


        [HttpPost]
        public IActionResult PostAsync(IFormFile file, [FromForm]string endpointKey = null, [FromForm]string microsoftAppPassword = null)
        {
            if (file == null)
            {
                return BadRequest();
            }

            BotManager.SetCurrent(file.OpenReadStream(), endpointKey, microsoftAppPassword);
                
            return Ok();
        }
    }
}
