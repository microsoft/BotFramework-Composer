// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.IO;
using Microsoft.Bot.Builder.Integration.AspNet.Core;

namespace Microsoft.Bot.Builder.ComposerBot.Json
{
    public interface IBotManager
    {
        IBotFrameworkHttpAdapter CurrentAdapter { get; }

        IBot CurrentBot { get; }

        void SetCurrent(Stream fileStream, string endpointKey = null, string appPwd = null);
    }
}
