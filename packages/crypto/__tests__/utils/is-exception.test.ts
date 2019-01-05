import "jest-extended";

import { configManager } from "../../src/managers";
import { isException } from "../../src/utils";

describe("IsException", () => {
    it("should return true", () => {
        configManager.get = jest.fn(() => ["1"]);
        expect(isException({ id: "1" })).toBeTrue();
    });

    it("should return false", () => {
        configManager.get = jest.fn(() => ["1"]);
        expect(isException({ id: "2" })).toBeFalse();

        configManager.get = jest.fn(() => undefined);
        expect(isException({ id: "2" })).toBeFalse();

        configManager.get = jest.fn(() => undefined);
        expect(isException({ id: undefined })).toBeFalse();
    });
});
