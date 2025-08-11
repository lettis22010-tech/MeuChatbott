import { Chroma, ChromaLibArgs } from '@langchain/community/vectorstores/chroma';
import { Embeddings } from '@langchain/core/embeddings';
import type { Collection } from 'chromadb';
interface ChromaAuth {
    chromaApiKey?: string;
}
export declare class ChromaExtended extends Chroma {
    chromaApiKey?: string;
    chromaTenant?: string;
    chromaDatabase?: string;
    constructor(embeddings: Embeddings, args: ChromaLibArgs & Partial<ChromaAuth>);
    static fromExistingCollection(embeddings: Embeddings, dbConfig: ChromaLibArgs & Partial<ChromaAuth>): Promise<Chroma>;
    ensureCollection(): Promise<Collection>;
}
export {};
