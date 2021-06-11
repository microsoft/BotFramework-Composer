using System.Runtime.CompilerServices;

namespace Underscore.Bot.MessageRouting.Logging
{
    public interface ILogger
    {
        /// <summary>
        /// Logs the given message.
        /// </summary>
        /// <param name="message">The message to log.</param>
        /// <param name="methodName">Resolved by the [CallerMemberName] attribute. No value required.</param>
        void Log(string message, [CallerMemberName] string methodName = "");

        /// <summary>
        /// Logs the given message.
        /// </summary>
        /// <param name="message">The message to log.</param>
        /// <param name="methodName">Resolved by the [CallerMemberName] attribute. No value required.</param>
        void LogInformation(string message, [CallerMemberName] string methodName = "");

        /// <summary>
        /// Logs the given message.
        /// </summary>
        /// <param name="message">The message to log.</param>
        /// <param name="methodName">Resolved by the [CallerMemberName] attribute. No value required.</param>
        void LogError(string message, [CallerMemberName] string methodName = "");

    }
}