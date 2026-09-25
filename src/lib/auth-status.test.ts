import { describe, expect, it } from "vitest";
import { isStatusActive } from "./auth-status";

describe("isStatusActive", () => {
  it("returns true for ACTIVE", () => {
    expect(isStatusActive("ACTIVE")).toBe(true);
  });

  it("returns false for BLOCKED", () => {
    expect(isStatusActive("BLOCKED")).toBe(false);
  });

  it("returns false for DELETED", () => {
    expect(isStatusActive("DELETED")).toBe(false);
  });

  it("returns false for undefined (fail-closed)", () => {
    expect(isStatusActive(undefined)).toBe(false);
  });

  it("returns false for null (fail-closed)", () => {
    expect(isStatusActive(null)).toBe(false);
  });
});
