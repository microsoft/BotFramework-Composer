using System;

namespace BotProject
{
    public class EventWatcher
    {
        public event EventHandler<FileChangeArgs> Changed;

        private static long lastPostingTime;

        private static object locker;

        private static EventWatcher _watcher;

        // Need to clean the watcher after restarting
        public static void Clean()
        {
            _watcher = null;
        }

        public static EventWatcher GetWatcher()
        {
            // Keep a global watcher for restarting the server
            if (_watcher == null)
            {
                _watcher = new EventWatcher();
                locker = new object();
                lastPostingTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            }

            return _watcher;
        }

        public void FileChange(string path, string id, string resourceType)
        {
            // Ensure thread safe
            lock (locker)
            {
                FileChangeArgs args = new FileChangeArgs(path, id, resourceType);

                var curPostingTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                // Need to ensure the updating time is no less than 3 secs since 
                // it might deliver many events at the same time.
                if (curPostingTime - lastPostingTime >= 3)
                {
                    OnChanged(args);
                }

                lastPostingTime = curPostingTime;
            }
        }

        protected virtual void OnChanged(FileChangeArgs e)
        {
            EventHandler<FileChangeArgs> handler = Changed;
            handler?.Invoke(this, e);
        }

    }

    public class FileChangeArgs: EventArgs
    {
        public string path { get; set; }
        public string id { get; set; }
        public string resourceType { get; set; }

        public FileChangeArgs(string path, string id, string resourceType)
            :base()
        {
            this.path = path;
            this.id = id;
            this.resourceType = resourceType;
        }

    }
}
