(self as any).MonacoEnvironment = {
    getWorkerUrl: () => './editor.worker.bundle.js'
}
import './client.ts';
