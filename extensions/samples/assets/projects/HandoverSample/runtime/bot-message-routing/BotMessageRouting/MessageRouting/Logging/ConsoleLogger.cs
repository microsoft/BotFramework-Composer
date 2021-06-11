using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;

namespace Underscore.Bot.MessageRouting.Logging
{
    public class ConsoleLogger : Bot.MessageRouting.Logging.ILogger
    {
        private readonly Microsoft.Extensions.Logging.ILogger _logger;

        public ConsoleLogger(Microsoft.Extensions.Logging.ILogger logger)
        {
            _logger = logger;
        }

        public void Log(string message, [CallerMemberName] string methodName = "")
        {
            _logger.LogDebug(BuildMessage(message, methodName));
        }

        public void LogError(string message, [CallerMemberName] string methodName = "")
        {
            _logger.LogError(BuildMessage(message, methodName));
        }

        public void LogInformation(string message, [CallerMemberName] string methodName = "")
        {
            _logger.LogInformation(BuildMessage(message, methodName));
        }

        private string BuildMessage(string message, string methodName)
        {
            var msg = $"{DateTime.Now}> ";
            if (!string.IsNullOrWhiteSpace(methodName))
                msg += $"{methodName}: {message}";
            else
                msg += message;

            return msg;
        }
    }
}
