// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PublishTarget } from '@bfc/shared';

export interface IContentProviderMetadata {
  [key: string]: any;
}

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

export abstract class ExternalContentProvider<T extends IContentProviderMetadata> {
  constructor(protected metadata: T) {}

  /**
   * Downloads bot content and returns a path to the downloaded content.
   */
  abstract downloadBotContent(): Promise<BotContentInfo>;

  /**
   * Cleans up any leftover downloaded bot content and performs any other needed cleanup.
   */
  abstract cleanUp(): Promise<void>;

  /**
   * Returns a custom identifier defined by the service that will allow Composer
   * to detect if the project has already been imported on successive imports.
   *
   * For example:
   * A user imports their bot from Service A and creates a new bot project named
   * MyBot in Composer. User modifies their project in Service A and renames it to
   * MyBotNew. User imports their updated project into Composer.
   *
   * Behind the scenes, Service A constructs a unique alias that can be used to identify
   * MyBot even though its display name might have been changed. Composer can now use this
   * alias to detect that MyBot in Composer is the same bot as MyBotNew in Service A that
   * is being imported. Composer can now prompt the user and ask if they want to save the
   * updated content to the existing project.
   */
  getAlias?(): Promise<string>;

  /**
   * (Optional) Performs any necessary authentication for the service and returns an access token.
   */
  authenticate?(): Promise<string>;

  /**
   * (Optional) Generates a publish profile based on the provider.
   */
  generateProfile?(): Promise<PublishTarget>;
}
