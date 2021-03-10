using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.BotFramework.Composer.Intermediator.Resources
{
    class StringConstants
    {
        public static readonly string NoUserNamePlaceholder = "(no user name)";
        public static readonly string NoNameOrId = "(no name or ID)";

        public static readonly string LineBreak = "\n\r";
        public static readonly char QuotationMark = '"';

        // For parsing JSON
        public static readonly string EndOfLineInJsonResponse = "\\r\\n";
        public static readonly char BackslashInJsonResponse = '\\';
    }
}
