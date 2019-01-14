import "jest-extended";
import { MultiPaymentBuilder } from "../../../src/builder/transactions/multi-payment";
import { client as ark } from "../../../src/client";
import { TransactionTypes } from "../../../src/constants";
import { feeManager } from "../../../src/managers/fee";
import { transactionBuilder } from "./__shared__/transaction-builder";

let builder : MultiPaymentBuilder;

beforeEach(() => {
    builder = ark.getBuilder().multiPayment();
});

describe("Multi Payment Transaction", () => {
    transactionBuilder( () => builder);

    it("should have its specific properties", () => {
        expect(builder).toHaveProperty("data.type", TransactionTypes.MultiPayment);
        expect(builder).toHaveProperty("data.fee", feeManager.get(TransactionTypes.MultiPayment));
        expect(builder).toHaveProperty("data.payments", {});
        expect(builder).toHaveProperty("data.vendorFieldHex", null);
    });

    describe("vendorField", () => {
        it("should set the vendorField", () => {
            const data = "dummy";
            builder.vendorField(data);
            expect(builder.data.vendorField).toBe(data);
        });
    });

    describe("addPayment", () => {
        it("should add new payments", () => {
            builder.addPayment("address", 1);
            builder.addPayment("address", 2);
            builder.addPayment("address", 3);

            expect(builder.data.payments).toEqual({
                address1: "address",
                address2: "address",
                address3: "address",
                amount1: 1,
                amount2: 2,
                amount3: 3,
            });
        });
    });
});
