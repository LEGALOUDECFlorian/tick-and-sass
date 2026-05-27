import { describe, expect, it } from "vitest";
import { resolvers } from "./resolver";

describe("health resolver", () => {
  it("returns OK", () => {
    const result = resolvers.Query.health();

    expect(result).toBe("OK");
  });
});