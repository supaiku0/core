import { Database, State } from "@arkecosystem/core-interfaces";
import { MoreThanOrEqual } from "typeorm";
import { Round as RoundTypeorm } from "../entities/round";
import { Round } from "../models";
import { queries } from "../queries";
import { Repository } from "./repository";

export class RoundsRepository extends Repository implements Database.IRoundsRepository {
    public async findById(round: number): Promise<Database.IRound[]> {
        return this.db.manyOrNone(queries.rounds.find, { round });
    }

    public async delete(round: number, db?: any): Promise<void> {
        await this.typeorm.getRepository(RoundTypeorm).delete({
            round: MoreThanOrEqual(round),
        });

        return;
    }

    public async insert(delegates: State.IWallet[]): Promise<void> {
        const rounds: Array<Partial<Database.IRound>> = delegates.map(delegate => {
            return {
                publicKey: delegate.publicKey,
                balance: delegate.getAttribute("delegate.voteBalance"),
                round: delegate.getAttribute("delegate.round"),
            };
        });

        await this.typeorm.getRepository(RoundTypeorm).save(rounds);
    }

    public async update(items: object | object[]): Promise<void> {
        return;
    }

    public getModel(): Round {
        return new Round(this.pgp);
    }
}
