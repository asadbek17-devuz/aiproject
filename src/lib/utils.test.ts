import { describe, expect, it } from "vitest";
import { cn, formatUzs, initials } from "@/lib/utils";

describe("cn", () => {
  it("resolves conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatUzs", () => {
  it("converts tiyin to so'm", () => {
    expect(formatUzs(100)).toBe("1 so'm");
  });
});

describe("initials", () => {
  it("uses at most two name parts", () => {
    expect(initials("Aziza Karimova")).toBe("AK");
    expect(initials("Sardor")).toBe("S");
    expect(initials("  ")).toBe("");
  });
});
