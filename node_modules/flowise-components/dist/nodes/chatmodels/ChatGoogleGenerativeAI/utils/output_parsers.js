"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleGenerativeAIToolsOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const types_1 = require("@langchain/core/utils/types");
class GoogleGenerativeAIToolsOutputParser extends output_parsers_1.BaseLLMOutputParser {
    static lc_name() {
        return 'GoogleGenerativeAIToolsOutputParser';
    }
    constructor(params) {
        super(params);
        this.lc_namespace = ['langchain', 'google_genai', 'output_parsers'];
        this.returnId = false;
        /** Whether to return only the first tool call. */
        this.returnSingle = false;
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.zodSchema = params.zodSchema;
    }
    async _validateResult(result) {
        if (this.zodSchema === undefined) {
            return result;
        }
        const zodParsedResult = await (0, types_1.interopSafeParseAsync)(this.zodSchema, result);
        if (zodParsedResult.success) {
            return zodParsedResult.data;
        }
        else {
            throw new output_parsers_1.OutputParserException(`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error.issues)}`, JSON.stringify(result, null, 2));
        }
    }
    async parseResult(generations) {
        const tools = generations.flatMap((generation) => {
            const { message } = generation;
            if (!('tool_calls' in message) || !Array.isArray(message.tool_calls)) {
                return [];
            }
            return message.tool_calls;
        });
        if (tools[0] === undefined) {
            throw new Error('No parseable tool calls provided to GoogleGenerativeAIToolsOutputParser.');
        }
        const [tool] = tools;
        const validatedResult = await this._validateResult(tool.args);
        return validatedResult;
    }
}
exports.GoogleGenerativeAIToolsOutputParser = GoogleGenerativeAIToolsOutputParser;
//# sourceMappingURL=output_parsers.js.map