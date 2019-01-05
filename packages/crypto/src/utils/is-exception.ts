import { configManager } from "../managers";

/**
 * Check if the given block or transaction id is an exception.
 */
export function isException(blockOrTransaction: { id: string }): boolean {
    return ["blocks", "transactions"].some(key => {
        const exceptions = configManager.get(`exceptions.${key}`);
        return Array.isArray(exceptions) && exceptions.includes(blockOrTransaction.id);
    });
}
