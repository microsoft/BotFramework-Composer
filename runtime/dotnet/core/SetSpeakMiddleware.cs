using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;

namespace Microsoft.BotFramework.Composer.Core
{
    public class SetSpeakMiddleware : IMiddleware
    {
        private readonly string _voiceName;
        private readonly bool _fallbackToTextForSpeak;

        public SetSpeakMiddleware(string voiceName, bool fallbackToTextForSpeak)
        {
            _voiceName = voiceName;
            _fallbackToTextForSpeak = fallbackToTextForSpeak;
        }

        public async Task OnTurnAsync(ITurnContext turnContext, NextDelegate next, CancellationToken cancellationToken = default)
        {
            turnContext.OnSendActivities(async (ctx, activities, nextSend) =>
            {
                foreach (var activity in activities)
                {
                    if (activity.Type == ActivityTypes.Message)
                    {
                        if (_fallbackToTextForSpeak && string.IsNullOrEmpty(activity.Speak))
                        {
                            activity.Speak = activity.Text;
                        }

                        if (!string.IsNullOrEmpty(activity.Speak)
                            && !string.IsNullOrEmpty(_voiceName)
                            && (activity.ChannelId == Bot.Connector.Channels.DirectlineSpeech
                                || activity.ChannelId == Bot.Connector.Channels.Emulator
                                || activity.ChannelId == "telephony"))
                        {
                            if (!HasTag("speak", activity.Speak))
                            {
                                if (!HasTag("voice", activity.Speak))
                                {
                                    activity.Speak = $"<voice name='{_voiceName}'>{activity.Speak}</voice>";
                                }

                                activity.Speak = $"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{activity.Locale ?? "en-US"}'>{activity.Speak}</speak>";
                            }
                        }
                    }
                }

                return await nextSend().ConfigureAwait(false);
            });

            await next(cancellationToken);
        }

        public bool HasTag(string tagName, string speakText)
        {
            try
            {
                var speakSsmlDoc = XDocument.Parse(speakText);

                if (speakSsmlDoc.Root != null && speakSsmlDoc.Root.AncestorsAndSelf().Any(x => x.Name.LocalName.ToLowerInvariant() == tagName))
                {
                    return true;
                }

                return false;
            }
            catch (XmlException)
            {
                return false;
            }
        }
    }
}
