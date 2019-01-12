import secp256k1 from "secp256k1";
import wif from "wif";

import { HashAlgorithms } from "../crypto";
import { KeyPair } from "../crypto/crypto";
import { configManager } from "../managers";
import { INetwork } from "../networks";

export class Keys {
    public static fromPassphrase(passphrase: string, compressed: boolean = true): KeyPair {
        const privateKey = HashAlgorithms.sha256(Buffer.from(passphrase, "utf8"));
        return Keys.fromPrivateKey(privateKey, compressed);
    }

    public static fromPrivateKey(privateKey: Buffer | string, compressed: boolean = true): KeyPair {
        privateKey = privateKey instanceof Buffer ? privateKey : Buffer.from(privateKey, "hex");

        const publicKey = secp256k1.publicKeyCreate(privateKey, compressed);
        const keyPair = {
            publicKey: publicKey.toString("hex"),
            privateKey: privateKey.toString("hex"),
            compressed,
        };

        return keyPair;
    }

    public static fromWIF(wifKey: string, network?: INetwork): KeyPair {
        if (!network) {
            network = configManager.all();
        }

        // @ts-ignore
        const decoded = wif.decode(wifKey);
        const version = decoded.version;

        if (version !== network.wif) {
            throw new Error("Invalid network version");
        }

        const privateKey = decoded.privateKey;
        const publicKey = secp256k1.publicKeyCreate(privateKey, decoded.compressed);

        const keyPair = {
            publicKey: publicKey.toString("hex"),
            privateKey: privateKey.toString("hex"),
            compressed: decoded.compressed,
        };

        return keyPair;
    }
}
