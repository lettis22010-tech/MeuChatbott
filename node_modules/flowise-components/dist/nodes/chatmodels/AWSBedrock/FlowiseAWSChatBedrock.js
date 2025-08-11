"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockChat = void 0;
const aws_1 = require("@langchain/aws");
const DEFAULT_IMAGE_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0';
const DEFAULT_IMAGE_MAX_TOKEN = 1024;
class BedrockChat extends aws_1.ChatBedrockConverse {
    constructor(id, fields) {
        super(fields);
        this.id = id;
        this.configuredModel = fields?.model || '';
        this.configuredMaxToken = fields?.maxTokens;
    }
    revertToOriginalModel() {
        this.model = this.configuredModel;
        this.maxTokens = this.configuredMaxToken;
    }
    setMultiModalOption(multiModalOption) {
        this.multiModalOption = multiModalOption;
    }
    setVisionModel() {
        if (!this.model.includes('claude-3')) {
            this.model = DEFAULT_IMAGE_MODEL;
            this.maxTokens = this.configuredMaxToken ? this.configuredMaxToken : DEFAULT_IMAGE_MAX_TOKEN;
        }
    }
}
exports.BedrockChat = BedrockChat;
//# sourceMappingURL=FlowiseAWSChatBedrock.js.map