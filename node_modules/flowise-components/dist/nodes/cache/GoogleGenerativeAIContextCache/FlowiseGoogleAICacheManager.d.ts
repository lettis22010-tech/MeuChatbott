import type { CachedContentBase, CachedContent, Content } from '@google/generative-ai';
import { GoogleAICacheManager as GoogleAICacheManagerBase } from '@google/generative-ai/server';
type CacheContentOptions = Omit<CachedContentBase, 'contents'> & {
    contents?: Content[];
};
export declare class GoogleAICacheManager extends GoogleAICacheManagerBase {
    private ttlSeconds;
    private cachedContents;
    setTtlSeconds(ttlSeconds: number): void;
    lookup(options: CacheContentOptions): Promise<CachedContent | undefined>;
}
export default GoogleAICacheManager;
