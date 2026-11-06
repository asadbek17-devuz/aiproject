import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/modules/auth/schema";

describe("registerSchema", () => {
  it("normalizes email and trims the name", () => {
    const parsed = registerSchema.parse({
      name: "  Aziza Karimova  ",
      email: "  AZIZA@Example.COM ",
      password: "Student123!",
    });
    expect(parsed.name).toBe("Aziza Karimova");
    expect(parsed.email).toBe("aziza@example.com");
  });

  it("rejects short passwords and invalid emails", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["name", "email", "password"]),
      );
    }
  });
});

describe("loginSchema", () => {
  it("accepts an existing password without enforcing registration rules", () => {
    expect(
      loginSchema.safeParse({ email: "student1@aiacademy.uz", password: "x" }).success,
    ).toBe(true);
  });
});
