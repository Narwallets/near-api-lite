import { BlockInfo } from "./near-rpc";
export declare const SECONDS = 1000;
export declare const MINUTES: number;
export declare const HOURS: number;
export declare function computeCurrentEpoch(): Promise<EpochInfo>;
export declare function asHM(durationHours: number): string;
export declare class EpochInfo {
    length: number;
    prev_epoch_duration_ms: number;
    prev_timestamp: number;
    start_block_height: number;
    start_timestamp: number;
    last_block_timestamp: number;
    start_dtm: Date;
    advance: number;
    duration_till_now_ms: number;
    ends_dtm: Date;
    constructor(prevBlock: BlockInfo, startBlock: BlockInfo, lastBlock: BlockInfo);
    update(lastBlock: BlockInfo): number;
    proportion(blockNum: number): number;
    block_dtm(blockNum: number): Date;
    hours_from_start(): number;
    hours_to_end(): number;
}
