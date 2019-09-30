type BigNumberType = BigInt | number | string | BigNumber;

const toBigNumber = (value: BigNumberType) =>
    value instanceof BigNumber ? BigInt((value as any).value) : BigInt(value);
class BigNumber {
    public static readonly ZERO: BigNumber = BigNumber.make(0);
    public static readonly ONE: BigNumber = BigNumber.make(1);
    public static readonly SATOSHI: BigNumber = BigNumber.make(1e8);

    public static make(value: BigNumberType, base?: number): BigNumber {
        return new BigNumber(value);
    }

    private value: bigint;
    private constructor(value: BigNumberType) {
        this.value = toBigNumber(value);
    }

    public plus(other: BigNumberType): BigNumber {
        return new BigNumber(this.value + toBigNumber(other));
    }

    public minus(other: BigNumberType): BigNumber {
        return new BigNumber(this.value - toBigNumber(other));
    }

    public times(other: BigNumberType): BigNumber {
        return new BigNumber(this.value * toBigNumber(other));
    }

    public dividedBy(other: BigNumberType): BigNumber {
        return new BigNumber(this.value / toBigNumber(other));
    }

    public div(other: BigNumberType): BigNumber {
        return this.dividedBy(other);
    }

    public isZero(): boolean {
        return this.value === BigInt(0);
    }

    public comparedTo(other: BigNumberType): number {
        const b = toBigNumber(other);
        if (this.value > b) {
            return 1;
        }

        if (this.value < b) {
            return -1;
        }

        return 0;
    }

    public isLessThan(other: BigNumberType): boolean {
        return this.value < toBigNumber(other);
    }

    public isLessThanEqual(other: BigNumberType): boolean {
        return this.value <= toBigNumber(other);
    }

    public lt(other: BigNumberType): boolean {
        return this.isLessThan(other);
    }

    public lte(other: BigNumberType): boolean {
        return this.isLessThanEqual(other);
    }

    public isGreaterThan(other: BigNumberType): boolean {
        return this.value > toBigNumber(other);
    }

    public isGreaterThanEqual(other: BigNumberType): boolean {
        return this.value >= toBigNumber(other);
    }

    public isGreaterThanOrEqualTo(other: BigNumberType): boolean {
        return this.isGreaterThanEqual(other);
    }

    public gt(other: BigNumberType): boolean {
        return this.isGreaterThan(other);
    }

    public gte(other: BigNumberType): boolean {
        return this.isGreaterThanEqual(other);
    }

    public isEqualTo(other: BigNumberType): boolean {
        return this.value === toBigNumber(other);
    }

    public isInteger(): boolean {
        return true; // FIXME
    }

    public isNegative(): boolean {
        return this.value < 0;
    }

    public toFixed(bla?): string {
        return this.value.toString();
    }

    public toJSON(): string {
        return this.toFixed();
    }
}

export { BigNumber };
