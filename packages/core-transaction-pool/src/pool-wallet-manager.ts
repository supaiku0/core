import { app } from "@arkecosystem/core-container";
import { WalletManager } from "@arkecosystem/core-database";
import { PostgresConnection } from "@arkecosystem/core-database-postgres";
import { constants, crypto, isException, models, Transaction } from "@arkecosystem/crypto";

const { Wallet } = models;
const { TransactionTypes } = constants;

export class PoolWalletManager extends WalletManager {
    public database = app.resolvePlugin<PostgresConnection>("database");

    /**
     * Create a new pool wallet manager instance.
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Get a wallet by the given address. If wallet is not found it is copied from blockchain
     * wallet manager. Method overrides base class method from WalletManager.
     * WARNING: call only upon guard apply, as if wallet not found it gets it from blockchain.
     * For existing key checks use function exists(key)
     * @param  {String} address
     * @return {(Wallet|null)}
     */
    public findByAddress(address) {
        if (!this.byAddress[address]) {
            const blockchainWallet = this.database.walletManager.findByAddress(address);
            const wallet = Object.assign(new Wallet(address), blockchainWallet); // do not modify

            this.reindex(wallet);
        }

        return this.byAddress[address];
    }

    public deleteWallet(publicKey) {
        this.forgetByPublicKey(publicKey);
        this.forgetByAddress(crypto.getAddress(publicKey, this.networkId));
    }

    /**
     * Checks if the transaction can be applied.
     * @param  {Object|Transaction} transaction
     * @param  {Array} errors The errors are written into the array.
     * @return {Boolean}
     */
    public canApply(transaction: Transaction, errors): boolean {
        // Edge case if sender is unknown and has no balance.
        // NOTE: Check is performed against the database wallet manager.
        if (!this.database.walletManager.byPublicKey[transaction.data.senderPublicKey]) {
            const senderAddress = crypto.getAddress(transaction.data.senderPublicKey, this.networkId);

            if (this.database.walletManager.findByAddress(senderAddress).balance.isZero()) {
                errors.push("Cold wallet is not allowed to send until receiving transaction is confirmed.");
                return false;
            }
        }

        const { data } = transaction;
        const { type, asset } = data;
        const sender = this.findByPublicKey(data.senderPublicKey);

        if (
            type === TransactionTypes.DelegateRegistration &&
            this.database.walletManager.byUsername[asset.delegate.username.toLowerCase()]
        ) {
            this.logger.error(
                `[PoolWalletManager] Can't apply transaction ${
                    transaction.id
                }: delegate name already taken. Data: ${JSON.stringify(transaction)}`,
            );

            errors.push(`Can't apply transaction ${transaction.id}: delegate name already taken.`);
            // NOTE: We use the vote public key, because vote transactions have the same sender and recipient.
        } else if (
            type === TransactionTypes.Vote &&
            !this.database.walletManager.__isDelegate(asset.votes[0].slice(1))
        ) {
            this.logger.error(
                `[PoolWalletManager] Can't apply vote transaction: delegate ${
                    asset.votes[0]
                } does not exist. Data: ${JSON.stringify(transaction)}`,
            );

            errors.push(`Can't apply transaction ${transaction.id}: delegate ${asset.votes[0]} does not exist.`);
        } else if (isException(data)) {
            this.logger.warn(
                `Transaction forcibly applied because it has been added as an exception: ${transaction.id}`,
            );
        } else if (!sender.canApply(transaction)) {
            const message = `[PoolWalletManager] Can't apply transaction id:${transaction.id} from sender:${
                sender.address
            }`;
            this.logger.error(`${message} due to ${JSON.stringify(errors)}`);
            errors.unshift(message);
        }

        return errors.length === 0;
    }

    /**
     * Remove the given transaction from a sender only.
     */
    public revertTransactionForSender(transaction: Transaction) {
        const { data } = transaction;
        const sender = this.findByPublicKey(data.senderPublicKey); // Should exist
        sender.revertTransactionForSender(transaction);
    }
}
