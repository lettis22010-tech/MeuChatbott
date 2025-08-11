"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPerplexity = void 0;
const perplexity_1 = require("@langchain/community/chat_models/perplexity");
// Extend the Langchain ChatPerplexity class to include Flowise-specific properties and methods
class ChatPerplexity extends perplexity_1.ChatPerplexity {
    constructor(id, fields) {
        super(fields);
        this.id = id;
        this.configuredModel = fields?.model ?? ''; // Use model from fields
        this.configuredMaxToken = fields?.maxTokens;
    }
    // Method to revert to the original model configuration
    revertToOriginalModel() {
        this.model = this.configuredModel;
        this.maxTokens = this.configuredMaxToken;
    }
    // Method to set multimodal options
    setMultiModalOption(multiModalOption) {
        this.multiModalOption = multiModalOption;
    }
    setVisionModel() {
        // pass
    }
}
exports.ChatPerplexity = ChatPerplexity;
//# sourceMappingURL=FlowiseChatPerplexity.js.map