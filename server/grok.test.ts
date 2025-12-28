import { describe, expect, it } from "vitest";
import { callGrok } from "./grok";

describe("Grok API", () => {
  it("validates API key with a simple request", async () => {
    const response = await callGrok([
      {
        role: "user",
        content: "Say 'API key is valid' if you can read this message.",
      },
    ]);

    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
    
    // Verify we got a meaningful response
    const content = response.toLowerCase();
    expect(content.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call
});
