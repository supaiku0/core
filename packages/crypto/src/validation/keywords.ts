import { Ajv } from "ajv";
import ajvKeywords from "ajv-keywords";
import { configManager } from "../managers";
import { Bignum, isGenesisTransaction } from "../utils";

const maxBytes = (ajv: Ajv) => {
    ajv.addKeyword("maxBytes", {
        type: "string",
        compile(schema, parentSchema) {
            return data => {
                if ((parentSchema as any).type !== "string") {
                    return false;
                }

                return Buffer.from(data, "utf8").byteLength <= schema;
            };
        },
        errors: false,
        metaSchema: {
            type: "integer",
            minimum: 0,
        },
    });
};

const transactionType = (ajv: Ajv) => {
    ajv.addKeyword("transactionType", {
        compile(schema) {
            return data => {
                return data === schema;
            };
        },
        errors: false,
        metaSchema: {
            type: "integer",
            minimum: 0,
        },
    });
};

const network = (ajv: Ajv) => {
    ajv.addKeyword("network", {
        compile(schema) {
            return data => {
                return schema && data === configManager.get("pubKeyHash");
            };
        },
        errors: false,
        metaSchema: {
            type: "boolean",
        },
    });
};

const bignumber = (ajv: Ajv) => {
    const instanceOf = ajvKeywords.get("instanceof").definition;
    instanceOf.CONSTRUCTORS.Bignum = Bignum;

    ajv.addKeyword("bignumber", {
        compile(schema) {
            return (data, dataPath, parentObject: any, property) => {
                const minimum = typeof schema.minimum !== "undefined" ? schema.minimum : 0;
                const maximum = typeof schema.maximum !== "undefined" ? schema.maximum : Number.MAX_SAFE_INTEGER;

                const bignum = new Bignum(data);

                if (!bignum.isInteger()) {
                    return false;
                }

                let bypassGenesis = false;
                if (schema.bypassGenesis) {
                    if (parentObject.id) {
                        if (schema.block) {
                            bypassGenesis = parentObject.height === 1;
                        } else {
                            bypassGenesis = isGenesisTransaction(parentObject.id);
                        }
                    }
                }

                if (bignum.isLessThan(minimum) && !(bignum.isZero() && bypassGenesis)) {
                    return false;
                }

                if (bignum.isGreaterThan(maximum) && !bypassGenesis) {
                    return false;
                }

                if (parentObject && property) {
                    parentObject[property] = bignum;
                }

                return true;
            };
        },
        errors: false,
        modifying: true,
        metaSchema: {
            type: "object",
            properties: {
                minimum: { type: "integer" },
                maximum: { type: "integer" },
                bypassGenesis: { type: "boolean" },
                block: { type: "boolean" },
            },
            additionalItems: false,
        },
    });
};

const blockId = (ajv: Ajv) => {
    ajv.addKeyword("blockId", {
        compile(schema) {
            return (data, dataPath, parentObject: any) => {
                if (parentObject && parentObject.height === 1 && schema.allowNullWhenGenesis) {
                    return !data || Number(data) === 0;
                }

                if (typeof data !== "string") {
                    return false;
                }

                if (schema.hex) {
                    return /^[0123456789A-Fa-f]+$/.test(data);
                }

                return /^[0-9]+$/.test(data);
            };
        },
        errors: false,
        metaSchema: {
            type: "object",
            properties: {
                hex: { type: "boolean" },
                allowNullWhenGenesis: { type: "boolean" },
            },
            additionalItems: false,
        },
    });
};

export const keywords = [bignumber, blockId, maxBytes, network, transactionType];
