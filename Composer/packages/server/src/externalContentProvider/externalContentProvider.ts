export type ContentProviderMetadata = {
  [key: string]: any;
};

export type BotContentInfo = {
  /** Where the bot content .zip is located */
  zipPath: string;

  /** ETag signifying the current snapshot of the bot content */
  eTag: string;

  /** @description
   * (Optional) The url suffix to allow a post-import deep link into a dialog & trigger.
   *  Ex. "dialogs/my-dialog?selected=triggers[%22trigger-id%22]" will navigate to /bot/BOT-ID/dialogs/my-dialog?selected=triggers[%22trigger-id%22]
   */
  urlSuffix?: string;
};

export abstract class ExternalContentProvider {
  constructor(protected metadata: ContentProviderMetadata = {}) {}

  /**
   * Downloads bot content and returns a path to the downloaded content.
   */
  abstract async downloadBotContent(): Promise<BotContentInfo>;

  /**
   * Cleans up any leftover downloaded bot content and performs any other needed cleanup.
   */
  abstract async cleanUp(): Promise<void>;
}
