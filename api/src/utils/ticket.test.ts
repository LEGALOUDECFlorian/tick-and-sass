import { describe, expect, it } from "vitest";
import { normalizeTicketTitle } from "./ticket";

describe("normalizeTicketTitle", () => {
  it("removes useless spaces around a ticket title", () => {
    const result = normalizeTicketTitle("  Corriger le formulaire  ");

    expect(result).toBe("Corriger le formulaire");
  });
});