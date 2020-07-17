import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { AzureBotServiceContext } from "../azureBotServiceContext";
/** Class representing a Channels. */
export declare class Channels {
    private readonly client;
    /**
     * Create a Channels.
     * @param {AzureBotServiceContext} client Reference to the service client.
     */
    constructor(client: AzureBotServiceContext);
    /**
     * Creates a Channel registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param parameters The parameters to provide for the created bot.
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, parameters: Models.BotChannel, options?: msRest.RequestOptionsBase): Promise<Models.ChannelsCreateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param parameters The parameters to provide for the created bot.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, parameters: Models.BotChannel, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param parameters The parameters to provide for the created bot.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, parameters: Models.BotChannel, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * Updates a Channel registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, options?: Models.ChannelsUpdateOptionalParams): Promise<Models.ChannelsUpdateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, options: Models.ChannelsUpdateOptionalParams, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * Deletes a Channel registration from a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, channelName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, channelName: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, channelName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
    /**
     * Returns a BotService Channel registration specified by the parameters.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, channelName: string, options?: msRest.RequestOptionsBase): Promise<Models.ChannelsGetResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, channelName: string, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, channelName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * Lists a Channel registration for a Bot Service including secrets
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsListWithKeysResponse>
     */
    listWithKeys(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, options?: msRest.RequestOptionsBase): Promise<Models.ChannelsListWithKeysResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param callback The callback
     */
    listWithKeys(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param channelName The name of the Channel resource. Possible values include: 'FacebookChannel',
     * 'EmailChannel', 'KikChannel', 'TelegramChannel', 'SlackChannel', 'MsTeamsChannel',
     * 'SkypeChannel', 'WebChatChannel', 'DirectLineChannel', 'SmsChannel'
     * @param options The optional parameters
     * @param callback The callback
     */
    listWithKeys(resourceGroupName: string, resourceName: string, channelName: Models.ChannelName, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotChannel>): void;
    /**
     * Returns all the Channel registrations of a particular BotService resource
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ChannelsListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ChannelResponseList>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ChannelResponseList>): void;
    /**
     * Returns all the Channel registrations of a particular BotService resource
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.ChannelsListByResourceGroupNextResponse>
     */
    listByResourceGroupNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.ChannelsListByResourceGroupNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.ChannelResponseList>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ChannelResponseList>): void;
}
//# sourceMappingURL=channels.d.ts.map