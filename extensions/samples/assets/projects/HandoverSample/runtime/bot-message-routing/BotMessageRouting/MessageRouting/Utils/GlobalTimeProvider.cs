using System;

namespace Underscore.Bot.MessageRouting.Utils
{
    /// <summary>
    /// Provides the global time. Used by the message router manager and, moreover,
    /// the routing data manager to set times for e.g. connection (conversation) requested and
    /// connection established events.
    ///
    /// The base class here is for convenience. Derive from this, create your own and provide to
    /// the message router manager constructor to define your own global "now" time for the
    /// aforementioned events.
    /// </summary>
    public class GlobalTimeProvider
    {
        public virtual DateTime GetCurrentTime()
        {
            return DateTime.UtcNow;
        }
    }
}