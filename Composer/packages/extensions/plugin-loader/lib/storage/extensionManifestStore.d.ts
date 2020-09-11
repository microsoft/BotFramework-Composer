import { ExtensionMap, ExtensionMetadata } from '../types/extension';
export interface ExtensionManifest {
    extensions: ExtensionMap;
}
/** In-memory representation of extensions.json as well as reads / writes data to disk. */
export declare class ExtensionManifestStore {
    private manifest;
    private manifestPath;
    constructor();
    private readManifestFromDisk;
    private writeManifestToDisk;
    getExtensionConfig(id: string): ExtensionMetadata;
    getExtensions(): ExtensionMap;
    removeExtension(id: string): void;
    updateExtensionConfig(id: string, newConfig: Partial<ExtensionMetadata>): void;
}
//# sourceMappingURL=extensionManifestStore.d.ts.map