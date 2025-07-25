"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.serialize = exports.BinaryReader = exports.BinaryWriter = exports.BorshError = exports.decodeBase58 = exports.encodeBase58 = void 0;
const bs58 = __importStar(require("./bs58.js"));
const bn_js_1 = __importDefault(require("bn.js"));
// TODO: Make sure this polyfill not included when not required
//import * as encoding from 'text-encoding-utf-8';
//const TextDecoder = (typeof (global as any).TextDecoder !== 'function') ? encoding.TextDecoder : (global as any).TextDecoder;
//const textDecoder = new TextDecoder('utf-8', { fatal: true });
function encodeBase58(value) {
    if (typeof (value) === 'string') {
        value = Buffer.from(value, 'utf8');
    }
    return bs58.encode(Buffer.from(value));
}
exports.encodeBase58 = encodeBase58;
function decodeBase58(value) {
    return Buffer.from(bs58.decode(value));
}
exports.decodeBase58 = decodeBase58;
const INITIAL_LENGTH = 1024;
class BorshError extends Error {
    constructor(message) {
        super(message);
        this.fieldPath = [];
        this.originalMessage = message;
    }
    addToFieldPath(fieldName) {
        this.fieldPath.splice(0, 0, fieldName);
        // NOTE: Modifying message directly as jest doesn't use .toString()
        this.message = this.originalMessage + ': ' + this.fieldPath.join('.');
    }
}
exports.BorshError = BorshError;
/// Binary encoder.
class BinaryWriter {
    constructor() {
        this.buf = Buffer.alloc(INITIAL_LENGTH);
        this.length = 0;
    }
    maybe_resize() {
        if (this.buf.length < 16 + this.length) {
            this.buf = Buffer.concat([this.buf, Buffer.alloc(INITIAL_LENGTH)]);
        }
    }
    write_u8(value) {
        this.maybe_resize();
        this.buf.writeUInt8(value, this.length);
        this.length += 1;
    }
    write_u32(value) {
        this.maybe_resize();
        this.buf.writeUInt32LE(value, this.length);
        this.length += 4;
    }
    write_u64(value) {
        this.maybe_resize();
        this.write_buffer(Buffer.from(new bn_js_1.default(value).toArray('le', 8)));
    }
    write_u128(value) {
        this.maybe_resize();
        this.write_buffer(Buffer.from(new bn_js_1.default(value).toArray('le', 16)));
    }
    write_buffer(buffer) {
        // Buffer.from is needed as this.buf.subarray can return plain Uint8Array in browser
        this.buf = Buffer.concat([Buffer.from(this.buf.subarray(0, this.length)), buffer, Buffer.alloc(INITIAL_LENGTH)]);
        this.length += buffer.length;
    }
    write_string(str) {
        this.maybe_resize();
        const b = Buffer.from(str, 'utf8');
        this.write_u32(b.length);
        this.write_buffer(b);
    }
    write_fixed_array(array) {
        this.write_buffer(Buffer.from(array));
    }
    write_array(array, fn) {
        this.maybe_resize();
        this.write_u32(array.length);
        for (const elem of array) {
            this.maybe_resize();
            fn(elem);
        }
    }
    toArray() {
        return this.buf.subarray(0, this.length);
    }
}
exports.BinaryWriter = BinaryWriter;
function handlingRangeError(target, propertyKey, propertyDescriptor) {
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = function (...args) {
        try {
            return originalMethod.apply(this, args);
        }
        catch (e) {
            console.error("Borsh", target, propertyKey);
            if (e instanceof RangeError) {
                const code = e.code;
                if (['ERR_BUFFER_OUT_OF_BOUNDS', 'ERR_OUT_OF_RANGE'].indexOf(code) >= 0) {
                    throw new BorshError('Reached the end of buffer when deserializing');
                }
            }
            throw e;
        }
    };
}
class BinaryReader {
    constructor(buf) {
        this.buf = buf;
        this.offset = 0;
    }
    read_u8() {
        const value = this.buf.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }
    read_u32() {
        const value = this.buf.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    read_u64() {
        const buf = this.read_buffer(8);
        return new bn_js_1.default(buf, 'le');
    }
    read_u128() {
        const buf = this.read_buffer(16);
        return new bn_js_1.default(buf, 'le');
    }
    read_buffer(len) {
        if ((this.offset + len) > this.buf.length) {
            throw new BorshError(`Expected buffer length ${len} isn't within bounds`);
        }
        const result = this.buf.slice(this.offset, this.offset + len);
        this.offset += len;
        return result;
    }
    read_string() {
        const len = this.read_u32();
        const buf = this.read_buffer(len);
        try {
            return buf.toString("utf8");
        }
        catch (e) {
            throw new BorshError(`Error decoding UTF-8 string: ${e}`);
        }
    }
    read_fixed_array(len) {
        return new Uint8Array(this.read_buffer(len));
    }
    read_array(fn) {
        const len = this.read_u32();
        const result = Array();
        for (let i = 0; i < len; ++i) {
            result.push(fn());
        }
        return result;
    }
}
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_u8", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_u32", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_u64", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_u128", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_string", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_fixed_array", null);
__decorate([
    handlingRangeError
], BinaryReader.prototype, "read_array", null);
exports.BinaryReader = BinaryReader;
function serializeField(schema, fieldName, value, fieldType, writer) {
    try {
        // TODO: Handle missing values properly (make sure they never result in just skipped write)
        if (typeof fieldType === 'string') {
            writer[`write_${fieldType}`](value);
        }
        else if (fieldType instanceof Array) {
            if (typeof fieldType[0] === 'number') {
                if (value.length !== fieldType[0]) {
                    throw new BorshError(`Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`);
                }
                writer.write_fixed_array(value);
            }
            else {
                writer.write_array(value, (item) => { serializeField(schema, fieldName, item, fieldType[0], writer); });
            }
        }
        else if (fieldType.kind !== undefined) {
            switch (fieldType.kind) {
                case 'option': {
                    if (value === null) {
                        writer.write_u8(0);
                    }
                    else {
                        writer.write_u8(1);
                        serializeField(schema, fieldName, value, fieldType.type, writer);
                    }
                    break;
                }
                default: throw new BorshError(`FieldType ${fieldType} unrecognized`);
            }
        }
        else {
            if (!value) {
                console.error("fieldName:", fieldName, value, fieldType);
                throw new Error("serialize struct null/undefined value");
            }
            serializeStruct(schema, value, writer);
        }
    }
    catch (error) {
        if (error instanceof BorshError) {
            error.addToFieldPath(fieldName);
        }
        throw error;
    }
}
function serializeStruct(schema, obj, writer) {
    const structSchema = schema.get(obj.constructor);
    if (!structSchema) {
        throw new BorshError(`Class ${obj.constructor.name} is missing in schema`);
    }
    if (structSchema.kind === 'struct') {
        structSchema.fields.map(([fieldName, fieldType]) => {
            serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
        });
    }
    else if (structSchema.kind === 'enum') {
        const name = obj[structSchema.field];
        for (let idx = 0; idx < structSchema.values.length; ++idx) {
            const [fieldName, fieldType] = structSchema.values[idx];
            if (fieldName === name) {
                writer.write_u8(idx);
                serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
                break;
            }
        }
    }
    else {
        throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`);
    }
}
/// Serialize given object using schema of the form:
/// { class_name -> [ [field_name, field_type], .. ], .. }
function serialize(schema, obj) {
    const writer = new BinaryWriter();
    serializeStruct(schema, obj, writer);
    return writer.toArray();
}
exports.serialize = serialize;
function deserializeField(schema, fieldName, fieldType, reader) {
    try {
        if (typeof fieldType === 'string') {
            //@ts-ignore
            return reader[`read_${fieldType}`]();
        }
        if (fieldType instanceof Array) {
            if (typeof fieldType[0] === 'number') {
                return reader.read_fixed_array(fieldType[0]);
            }
            return reader.read_array(() => deserializeField(schema, fieldName, fieldType[0], reader));
        }
        return deserializeStruct(schema, fieldType, reader);
    }
    catch (error) {
        if (error instanceof BorshError) {
            error.addToFieldPath(fieldName);
        }
        throw error;
    }
}
function deserializeStruct(schema, classType, reader) {
    const structSchema = schema.get(classType);
    if (!structSchema) {
        throw new BorshError(`Class ${classType.name} is missing in schema`);
    }
    if (structSchema.kind === 'struct') {
        const result = {};
        for (const [fieldName, fieldType] of schema.get(classType).fields) {
            result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
        }
        return new classType(result);
    }
    if (structSchema.kind === 'enum') {
        const idx = reader.read_u8();
        if (idx >= structSchema.values.length) {
            throw new BorshError(`Enum index: ${idx} is out of range`);
        }
        const [fieldName, fieldType] = structSchema.values[idx];
        const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
        return new classType({ [fieldName]: fieldValue });
    }
    throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`);
}
/// Deserializes object from bytes using schema.
function deserialize(schema, classType, buffer) {
    const reader = new BinaryReader(buffer);
    const result = deserializeStruct(schema, classType, reader);
    if (reader.offset < buffer.length) {
        throw new BorshError(`Unexpected ${buffer.length - reader.offset} bytes after deserialized data`);
    }
    return result;
}
exports.deserialize = deserialize;
