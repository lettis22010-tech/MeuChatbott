import { z } from 'zod';
import { StructuredTool, ToolParams } from '@langchain/core/tools';
import { Serializable } from '@langchain/core/load/serializable';
declare abstract class BaseFileStore extends Serializable {
    abstract readFile(path: string): Promise<string>;
    abstract writeFile(path: string, contents: string): Promise<void>;
}
interface WriteFileParams extends ToolParams {
    store: BaseFileStore;
}
/**
 * Class for writing data to files on the disk. Extends the StructuredTool
 * class.
 */
export declare class WriteFileTool extends StructuredTool {
    static lc_name(): string;
    schema: any;
    name: string;
    description: string;
    store: BaseFileStore;
    constructor({ store, ...rest }: WriteFileParams);
    _call({ file_path, text }: z.infer<typeof this.schema>): Promise<string>;
}
export {};
