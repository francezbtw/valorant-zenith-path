import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const run = promisify(execFile);
const DB_URL = process.env.SUPABASE_DB_URL ?? process.env.DB_URL;

/**
 * Executes the SQL role-matrix suite for public.profiles / public.student_stats.
 * The script runs inside a transaction that is rolled back and writes no rows.
 */
describe.skipIf(!DB_URL)("RLS: profiles & student_stats", () => {
  it("enforces the expected access matrix for Admin, Mentor, Suporte and Aluno", async () => {
    const { stdout, stderr } = await run(
      "psql",
      [DB_URL!, "-v", "ON_ERROR_STOP=1", "-f", "supabase/tests/rls_profiles_stats.sql"],
      { maxBuffer: 10 * 1024 * 1024 },
    );

    const output = `${stdout}\n${stderr}`;
    expect(output, output).not.toMatch(/FAIL/);
    expect(output).toContain("RLS_TESTS_PASSED");
  }, 60_000);
});
