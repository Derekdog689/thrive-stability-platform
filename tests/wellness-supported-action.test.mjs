import test from "node:test";
import assert from "node:assert/strict";
import { supportedActionSuggestion } from "../src/app/wellness/supportedActionSuggestion.ts";

const blank = { energy: null, sleep: null, routine: null, confidence: null };

test("low energy returns a manageable option without claiming completion", () => {
  const action = supportedActionSuggestion({ ...blank, energy: "low", routine: "off_track" });
  assert.match(action.title, /ten minutes/i);
  assert.match(action.detail, /rest is also an option/i);
});

test("a disrupted routine returns a small practical step", () => {
  const action = supportedActionSuggestion({ ...blank, routine: "mixed" });
  assert.match(action.title, /routine/i);
  assert.match(action.detail, /few minutes/i);
});

test("low confidence does not interpret the participant clinically", () => {
  const action = supportedActionSuggestion({ ...blank, confidence: "low" });
  assert.match(action.detail, /familiar/i);
  assert.doesNotMatch(action.detail, /disorder|diagnosis|failure/i);
});

test("no relevant signals never assigns a task", () => {
  const action = supportedActionSuggestion(blank);
  assert.match(action.detail, /can also leave your check-in/i);
});
