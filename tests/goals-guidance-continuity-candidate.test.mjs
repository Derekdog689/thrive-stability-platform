import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/20261012001000_goals_guidance_continuity_v0_1.sql","utf8");
const view = readFileSync("src/app/goals-candidate/page.tsx","utf8");
const hook = readFileSync("src/app/goals/useParticipantGoals.ts","utf8");
test("migration is additive, nullable and constrained", () => {
  assert.match(sql,/add column guidance_choice text/);
  assert.match(sql,/add column guidance_usefulness text/);
  assert.match(sql,/guidance_consistency_check/);
  assert.doesNotMatch(sql,/drop table|delete from|create policy/i);
});
test("goal hook carries guidance and usefulness fields", () => {
  assert.match(hook,/guidance_choice, guidance_title, guidance_body, guidance_usefulness/);
  assert.match(hook,/guidance_usefulness: ParticipantGoal/);
});
test("participant explicitly keeps guidance and can respond later", () => {
  assert.match(view,/Keep this guidance/);
  assert.match(view,/Guidance you kept/);
  assert.match(view,/Not really/);
  assert.match(view,/Not sure yet/);
  assert.match(view,/guidance_usefulness: null/);
});
test("usefulness never changes goal completion", () => {
  assert.match(view,/onGuidanceSave\(goal, \{guidance_usefulness:value\}\)/);
  assert.match(view,/not goal completion/);
});
