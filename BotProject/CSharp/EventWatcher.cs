using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BotProject
{
    public class EventWatcher
    {
        public event EventHandler<FileChangeArgs> Changed;

        private static long lastPostingTime;

        private static object locker;


        private static EventWatcher _watcher;

        public static void Clean()
        {
            _watcher = null;
        }

        public static EventWatcher GetWatcher()
        {
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
            lock (locker)
            {
                FileChangeArgs args = new FileChangeArgs(path, id, resourceType);

                var curPostingTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                // we need to ensure the updating time is no less than 3 secs
                if (curPostingTime - lastPostingTime > 3)
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

        // provide remaining implementation for the class
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
