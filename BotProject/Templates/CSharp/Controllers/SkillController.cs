using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder.Integration.AspNet.Core;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    [ApiController]
    [Route("api/skills")]
    public class SkillController : ChannelServiceController
    {
        public SkillController(ChannelServiceHandler handler)
            : base(handler)
        {
        }
    }
}
