import { LLM, BaseLLMParams } from '@langchain/core/language_models/llms';
import { GenerationChunk } from '@langchain/core/outputs';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
export interface HFInput {
    model: string;
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    apiKey?: string;
    endpointUrl?: string;
    includeCredentials?: string | boolean;
}
export declare class HuggingFaceInference extends LLM implements HFInput {
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    model: string;
    temperature: number | undefined;
    stopSequences: string[] | undefined;
    maxTokens: number | undefined;
    topP: number | undefined;
    topK: number | undefined;
    frequencyPenalty: number | undefined;
    apiKey: string | undefined;
    endpointUrl: string | undefined;
    includeCredentials: string | boolean | undefined;
    constructor(fields?: Partial<HFInput> & BaseLLMParams);
    _llmType(): string;
    invocationParams(options?: this['ParsedCallOptions']): {
        model: string;
        parameters: {
            return_full_text: boolean;
            temperature: number | undefined;
            max_new_tokens: number | undefined;
            stop: string[] | undefined;
            top_p: number | undefined;
            top_k: number | undefined;
            repetition_penalty: number | undefined;
        };
    };
    _streamResponseChunks(prompt: string, options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<GenerationChunk>;
    /** @ignore */
    _call(prompt: string, options: this['ParsedCallOptions']): Promise<string>;
    /** @ignore */
    private _prepareHFInference;
    /** @ignore */
    static imports(): Promise<{
        HfInference: typeof import('@huggingface/inference').HfInference;
    }>;
}
