import * as networks from "./networks";

export type NetworkType =
    | typeof networks.mainnet.network
    | typeof networks.devnet.network
    | typeof networks.testnet.network
    | typeof networks.unitnet.network;

export type NetworkName = keyof typeof networks;

export type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } &
    { [P in U]: never } & { [x: string]: never })[T];

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;
