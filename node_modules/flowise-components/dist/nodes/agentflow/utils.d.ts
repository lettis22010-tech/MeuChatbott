import { MessageContentImageUrl } from '@langchain/core/messages';
import { ICommonObject } from '../../src/Interface';
import { BaseMessageLike } from '@langchain/core/messages';
import { IFlowState } from './Interface.Agentflow';
export declare const addImagesToMessages: (options: ICommonObject, allowImageUploads: boolean, imageResolution?: "auto" | "low" | "high") => Promise<MessageContentImageUrl[]>;
/**
 * Process message array to replace stored file references with base64 image data
 * @param messages Array of messages that may contain image references
 * @param options Common options object containing chatflowid and chatId
 * @returns Object containing updated messages array and transformed original messages
 */
export declare const processMessagesWithImages: (messages: BaseMessageLike[], options: ICommonObject) => Promise<{
    updatedMessages: BaseMessageLike[];
    transformedMessages: BaseMessageLike[];
}>;
/**
 * Replace base64 image data in messages with file references
 * @param messages Array of messages that may contain base64 image data
 * @param uniqueImageMessages Array of messages with file references for new images
 * @param pastImageMessages Array of messages with file references for previous images
 * @returns Updated messages array with file references instead of base64 data
 */
export declare const replaceBase64ImagesWithFileReferences: (messages: BaseMessageLike[], uniqueImageMessages?: BaseMessageLike[], pastImageMessages?: BaseMessageLike[]) => BaseMessageLike[];
/**
 * Get unique image messages from uploads
 * @param options Common options object containing uploads
 * @param messages Array of messages to check for existing images
 * @param modelConfig Model configuration object containing allowImageUploads and imageResolution
 * @returns Object containing imageMessageWithFileRef and imageMessageWithBase64
 */
export declare const getUniqueImageMessages: (options: ICommonObject, messages: BaseMessageLike[], modelConfig?: ICommonObject) => Promise<{
    imageMessageWithFileRef: BaseMessageLike;
    imageMessageWithBase64: BaseMessageLike;
} | undefined>;
/**
 * Get past chat history image messages
 * @param pastChatHistory Array of past chat history messages
 * @param options Common options object
 * @returns Object containing updatedPastMessages and transformedPastMessages
 */
export declare const getPastChatHistoryImageMessages: (pastChatHistory: BaseMessageLike[], options: ICommonObject) => Promise<{
    updatedPastMessages: BaseMessageLike[];
    transformedPastMessages: BaseMessageLike[];
}>;
/**
 * Updates the flow state with new values
 */
export declare const updateFlowState: (state: ICommonObject, llmUpdateState: IFlowState[]) => ICommonObject;
