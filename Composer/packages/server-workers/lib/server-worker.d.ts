import type { TemplateInstallationArgs } from './workers/templateInstallation.worker';
import type { DialogMergeArgs } from './workers/dialogMerge.worker';
export declare type WorkerName = 'dialogMerge' | 'templateInstallation';
export declare class ServerWorker {
  static execute(
    workerName: 'dialogMerge',
    args: DialogMergeArgs,
    updateProcess?: (status: number, message: string) => void
  ): any;
  static execute(
    workerName: 'templateInstallation',
    args: TemplateInstallationArgs,
    updateProcess?: (status: number, message: string) => void
  ): any;
  private static getWorkerPath;
}
//# sourceMappingURL=server-worker.d.ts.map
