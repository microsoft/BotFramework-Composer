// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

namespace Microsoft.BotFramework.Composer.Core.Settings
{
    public class BotSkillSettings
    {
        // Is skill
        public bool IsSkill { get; set; }
        public string[] AllowedCallers { get; set; }
    }
}
