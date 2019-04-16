import { ErrorObject } from "ajv";
import { TransactionTypes } from "../enums";
import { Overwrite } from "../types";
import { BigNumber } from "../utils";

export interface ITransaction {
    readonly id: string;
    readonly type: TransactionTypes;
    readonly verified: boolean;

    isVerified: boolean;

    data: ITransactionData;
    serialized: Buffer;
    timestamp: number;

    serialize(): ByteBuffer;
    deserialize(buf: ByteBuffer): void;

    verify(): boolean;

    toJson(): ITransactionJson;

    hasVendorField(): boolean;
}

export interface ITransactionAsset {
    signature?: {
        publicKey: string;
    };
    delegate?: {
        username: string;
        publicKey?: string;
    };
    votes?: string[];
    multisignature?: IMultiSignatureAsset;
    ipfs?: {
        dag: string;
    };
    payments?: any;
    [custom: string]: any;
}

export interface ITransactionData {
    version?: number;
    network?: number;

    type: TransactionTypes;
    timestamp: number;
    senderPublicKey: string;

    fee: BigNumber;
    amount: BigNumber;

    expiration?: number;
    recipientId?: string;

    asset?: ITransactionAsset;
    vendorField?: string;
    vendorFieldHex?: string;

    id?: string;
    signature?: string;
    secondSignature?: string;
    signSignature?: string;
    signatures?: string[];

    blockId?: string;
    sequence?: number;

    timelock?: any;
    timelockType?: number;

    ipfsHash?: string;
    payments?: { [key: string]: any };
}

interface ITransactionJsonExtension {
    fee: string;
    amount: string;
}

export interface ITransactionJson extends Overwrite<ITransactionData, ITransactionJsonExtension> {}

export interface ISchemaValidationResult<T = any> {
    value: T;
    error: any;
    errors?: ErrorObject[];
}

export interface IMultiPaymentItem {
    amount: BigNumber;
    recipientId: string;
}

export interface IMultiSignatureAsset {
    min: number;
    keysgroup: string[];
    lifetime: number;
}

export interface ISerializeOptions {
    excludeSignature?: boolean;
    excludeSecondSignature?: boolean;
}
