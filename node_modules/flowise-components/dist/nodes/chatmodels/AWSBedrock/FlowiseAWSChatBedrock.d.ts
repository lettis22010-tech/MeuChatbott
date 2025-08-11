import { IVisionChatModal, IMultiModalOption } from '../../../src';
import { ChatBedrockConverse as LCBedrockChat, ChatBedrockConverseInput } from '@langchain/aws';
export declare class BedrockChat extends LCBedrockChat implements IVisionChatModal {
    configuredModel: string;
    configuredMaxToken?: number;
    multiModalOption: IMultiModalOption;
    id: string;
    constructor(id: string, fields: ChatBedrockConverseInput);
    revertToOriginalModel(): void;
    setMultiModalOption(multiModalOption: IMultiModalOption): void;
    setVisionModel(): void;
}
