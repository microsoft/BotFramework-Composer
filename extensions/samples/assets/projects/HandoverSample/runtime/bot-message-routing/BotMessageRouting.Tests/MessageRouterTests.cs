using Microsoft.Bot.Connector.Authentication;
using Underscore.Bot.MessageRouting;

namespace Bot.MessageRouting.Tests
{
    public class MessageRouterTests : TestsFor<MessageRouter>
    {
        private MicrosoftAppCredentials _credentials;

        public override void BeforeTestClassCreation()
        {
            AutoMocker.Inject<MicrosoftAppCredentials>(Credentials);
        }

        #region Useful testhelpers

        private MicrosoftAppCredentials Credentials
        {
            get
            {
                if (_credentials == null)
                    _credentials = new MicrosoftAppCredentials("randomAppId", "randomPassword");

                return _credentials;
            }
        }

        #endregion Useful testhelpers

    }
}