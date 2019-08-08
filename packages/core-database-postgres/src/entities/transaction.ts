import { Utils } from "@arkecosystem/crypto";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "public", name: "transactions" })
export class Transaction {
    @PrimaryColumn({ length: 64 })
    public id: string;

    @Column({ type: "smallint" })
    public version: number;

    @Column({ name: "block_id", length: 64 })
    public blockId: string;

    @Column({ type: "smallint" })
    public sequence: number;
    public timestamp: number;

    @Column({ name: "sender_public_key", length: 66 })
    public senderPublicKey: string;

    @Column({ name: "recipient_id", length: 36 })
    public recipientId: string;

    @Column({ type: "smallint" })
    public type: number;

    @Column({ name: "vendor_field_hex", type: "bytea" })
    public vendorFieldHex: string;

    @Column({
        type: "bigint",
        transformer: {
            from: value => Utils.BigNumber.make(value),
            to: value => value.toFixed(),
        },
    })
    public amount: Utils.BigNumber;

    @Column({
        type: "bigint",
        transformer: {
            from: value => Utils.BigNumber.make(value),
            to: value => value.toFixed(),
        },
    })
    public fee: Utils.BigNumber;

    @Column({ type: "bytea" })
    public serialized: Buffer;

    @Column({ type: "jsonb" })
    public asset: any;

    @Column({ name: "type_group", type: "integer" })
    public typeGroup: number;

    @Column({
        type: "bigint",
        transformer: {
            from: value => Utils.BigNumber.make(value),
            to: value => value.toFixed(),
        },
    })
    public nonce: Utils.BigNumber;
}
