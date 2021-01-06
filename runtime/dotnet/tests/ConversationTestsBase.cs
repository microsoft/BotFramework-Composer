using System.IO;

namespace Tests
{
    public abstract class ConversationTestsBase
    {
        private static string getOsPath(string path) => Path.Combine(path.TrimEnd('\\').Split('\\'));

        protected static readonly string samplesDirectory = getOsPath(@"..\..\..\..\..\..\extensions\samples\assets\projects");
    }
}
