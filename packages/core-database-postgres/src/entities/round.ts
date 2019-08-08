import { Utils } from "@arkecosystem/crypto";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "public", name: "rounds" })
export class Round {
    @PrimaryColumn({ name: "public_key", length: 66 })
    public publicKey: string;

    @PrimaryColumn({
        type: "bigint",
        transformer: {
            from: value => Utils.BigNumber.make(value),
            to: value => value.toFixed(),
        },
    })
    public balance: string;

    @Column({
        type: "bigint",
    })
    public round: number;
}
