export declare type ByteArray = Uint8Array;
export declare function ByteArray(n: number | number[] | ArrayBuffer): ByteArray;
export declare type HalfArray = Uint16Array;
export declare function HalfArray(n: number | number[] | ArrayBuffer): HalfArray;
export declare type WordArray = Uint32Array;
export declare function WordArray(n: number | number[] | ArrayBuffer): WordArray;
export declare type IntArray = Int32Array;
export declare function IntArray(n: number | number[] | ArrayBuffer): IntArray;
export declare type NumArray = Float64Array;
export declare function NumArray(n: number | number[] | ArrayBuffer): NumArray;
export declare function checkArrayTypes(...arrays: ByteArray[]): void;
