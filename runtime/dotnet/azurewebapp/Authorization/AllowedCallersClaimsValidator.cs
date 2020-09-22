using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Bot.Connector.Authentication;
using Microsoft.BotFramework.Composer.Core.Settings;
using Microsoft.Extensions.Configuration;

namespace Microsoft.BotFramework.Composer.WebAppTemplates.Authorization
{
    public class AllowedCallersClaimsValidator : ClaimsValidator
    {
        private readonly BotSkillSettings _settings;
        private readonly List<string> _allowedCallers;

        public AllowedCallersClaimsValidator(BotSkillSettings settings)
        {
            _settings = settings;

            // skill.allowedCallers is the setting in the appsettings.json file
            // that consists of the list of parent bot IDs that are allowed to access the skill.
            // To add a new parent bot, simply edit the AllowedCallers and add
            // the parent bot's Microsoft app ID to the list.
            // In this sample, we allow all callers if AllowedCallers contains an "*".
            if (_settings == null || _settings.AllowedCallers == null || _settings.AllowedCallers.Length == 0)
            {
                throw new ArgumentNullException("skill.allowedCallers has to be defined, e.g. ['*'] or ['callerAppId']");
            }

            _allowedCallers = new List<string>(settings.AllowedCallers);
        }

        public override Task ValidateClaimsAsync(IList<Claim> claims)
        {
            // If _allowedCallers contains an "*", we allow all callers.
            if (SkillValidation.IsSkillClaim(claims) &&
                !_allowedCallers.Contains("*"))
            {
                // Check that the appId claim in the skill request is in the list of callers configured for this bot.
                var appId = JwtTokenValidation.GetAppIdFromClaims(claims);
                if (!_allowedCallers.Contains(appId))
                {
                    throw new UnauthorizedAccessException($"Received a request from a bot with an app ID of \"{appId}\". To enable requests from this caller, add the app ID to your configuration file.");
                }
            }

            return Task.CompletedTask;
        }
    }
}
