# THRIVE Wellness Viewport-Ownership Reconciliation v0.1

**Status:** review-only reconciliation  
**Implementation:** not authorized  
**Database:** unchanged  
**Quick path:** frozen  
**Production:** untouched  
**Goals:** parked  
**Trust Engine:** out of scope

## Verified current hierarchy

```text
AuthGate
└─ main.wellness-living-signal
   ├─ section page wrapper
   │  ├─ header.wellness-layered-scene
   │  ├─ section.wellness-layered-content
   │  │  └─ WellnessCheckinCandidate
   │  │     └─ WellnessExpandedExperience (when expanded)
   │  └─ details About your check-in
   └─ WellnessBottomNav (fixed z-50)
```

Current scenic CSS:

```css
.wellness-layered-scene {
  position: sticky;
  top: 10px;
  z-index: 0;
  transform: translateZ(0);
}

.wellness-layered-content {
  position: relative;
  z-index: 4;
  margin-top: -34px;
  backdrop-filter: blur(22px) saturate(1.08);
}
```

Mobile reduces sticky top to 6px and overlap to -26px.

Current expanded root:

```text
fixed inset-0 z-[90]
```

but it is mounted *inside* `.wellness-layered-content`.

## Reconciled defect

The expanded experience is currently a viewport-intended surface nested inside a layered-content stacking context.

That creates conflicting ownership:

1. The hero remains sticky and participates in the page's main scroll.
2. The body intentionally overlaps the hero using a negative top margin.
3. The body creates its own stacking context through explicit positioning/z-index and backdrop-filter.
4. The expanded experience is mounted under that body instead of at the Wellness shell/root level.
5. The fixed participant navigation is a sibling at global z-50, while the expanded surface's high z-index is still nested under the body's z-4 stacking context.
6. The document itself remains scrollable while expanded mode is open.

Observed result matches the screenshots:
- expanded content can disappear beneath or visually compete with the hero;
- the participant navigation remains visible above a supposedly full-screen expanded experience;
- page scrolling continues underneath;
- the shell appears compressed/squished rather than handing the viewport to expanded mode.

## Viewport ownership contract

### Normal Wellness mode

Owner of vertical scroll: **document / Wellness page**

```text
viewport
├─ environmental/scenic layer
├─ lane identity / hero
├─ normal Wellness content
├─ About your check-in
└─ participant bottom navigation
```

Normal mode may use the approved scenic handoff once its presentation is corrected.

### Expanded Wellness mode

Owner of vertical scroll: **Expanded Wellness only**

```text
viewport
├─ frozen/dimmed Wellness environment
└─ expanded Wellness root
   ├─ chooser / reflection / note
   └─ expanded action footer
```

While expanded mode owns the viewport:
- document/page scroll is locked;
- normal Wellness body does not scroll behind it;
- normal bottom navigation is hidden or made inert;
- About your check-in is not visible;
- hero does not remain an independently sticky competing surface;
- expanded content has one internal scroll container;
- the expanded action footer belongs to that same root.

## Mounting contract

`WellnessExpandedExperience` must not be rendered inside `.wellness-layered-content`.

Candidate ownership boundary:

```tsx
<main className="wellness-shell">
  <WellnessEnvironment />
  <WellnessNormalContent />
  <WellnessBottomNav />

  {expandedFlowVisible ? (
    <WellnessExpandedExperience />
  ) : null}
</main>
```

The expanded root should be a sibling of normal content at the Wellness page/shell level, or be portaled directly to `document.body`.

Preferred v0.1 candidate: **lift expanded ownership to the Wellness page shell rather than adding another portal abstraction**, unless source constraints make a portal materially safer.

## State ownership implication

The current expanded-state decision lives in `WellnessCheckinCandidate`.

To lift the expanded surface to page-shell level without duplicating state, one of two patterns is required:

### Candidate A: shell-aware orchestrator

Move the orchestration boundary up so `WellnessCheckinCandidate` can render:
- normal content into the body region;
- expanded content into a shell-level slot.

### Candidate B: portal

Keep orchestration where it is, but render `WellnessExpandedExperience` through a React portal to `document.body`.

**Recommended smallest safe implementation:** Candidate B for v0.1 viewport repair.

Reason:
- preserves accepted Wellness state/write orchestration;
- preserves quick path;
- avoids hoisting flow/draft state through `page.tsx`;
- removes expanded UI from the body's stacking/overlap context;
- gives expanded mode true viewport ownership.

A later environmental-shell refactor can replace the portal if desired.

## Expanded root contract

Candidate shell behavior:

```text
position: fixed
inset: 0
z-index: above participant navigation
height: 100dvh
overflow: hidden
```

Inside:

```text
expanded backdrop/environment
└─ expanded panel
   ├─ fixed/sticky expanded header
   ├─ ONE overflow-y-auto content viewport
   └─ fixed/sticky expanded footer
```

Avoid nested `fixed` footer positioning against the global viewport when an internal flex/grid layout can own the full `100dvh` surface.

Preferred structure:

```css
.expanded-root {
  position: fixed;
  inset: 0;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0,1fr) auto;
  overflow: hidden;
}

.expanded-content {
  min-height: 0;
  overflow-y: auto;
}
```

This yields one scroll context.

## Body scroll lock contract

When expanded mode opens:
- preserve current document scroll position;
- disable document/body scrolling;
- restore scroll state on close;
- do not jump the normal Wellness page back to top.

Implementation candidate:
- effect scoped to expanded visibility;
- add/remove a dedicated class or inline overflow lock;
- restore previous overflow value on cleanup.

## Bottom navigation contract

Normal mode:
- participant bottom nav visible.

Expanded mode:
- participant bottom nav hidden/inert.
- expanded footer replaces it temporarily.

This is not a navigation redesign. It is temporary viewport ownership.

## Hero contract

Normal mode:
- hero can participate in the environmental shell.

Expanded mode:
- hero must not remain a separate sticky interaction surface above the expanded layer.
- the environmental image may remain visually present only as a frozen/dimmed backdrop if desired.
- hero copy should not compete with chooser/reflection content.

## About-card contract

Normal mode:
- visible.

Expanded mode:
- hidden behind the expanded owner and not scrollable/interactable.

## Failure proof from current source

The current hierarchy mounts:

```text
WellnessExpandedExperience
inside
WellnessCheckinCandidate
inside
wellness-layered-content (z-4 + backdrop-filter)
```

while:

```text
WellnessBottomNav = fixed z-50 sibling
```

Therefore increasing child `z-[90]` / `z-[95]` is not a reliable repair because descendant z-index cannot escape its ancestor stacking context relative to global siblings.

This is why a larger z-index is explicitly rejected as the fix.

## No-band-aid rules

Do not solve with:
- z-index escalation only;
- more negative margins;
- shrinking the hero further;
- adding another sticky wrapper;
- another nested fixed scroll layer;
- hiding overflow on arbitrary ancestors until the screenshot looks right.

The fix must establish one viewport owner per mode.

## Acceptance tests

### Normal mode
- quick path remains visually/behaviorally unchanged.
- normal document scroll works.
- bottom nav remains visible.
- history/About remain reachable.

### Open expanded
- expanded surface immediately owns the viewport.
- chooser is fully visible.
- hero cannot cover it.
- bottom participant nav is not visible/interactable.
- normal page cannot scroll behind expanded mode.

### Expanded scroll
- only expanded content scrolls.
- expanded header/footer remain stable.
- no second scroll bar / page drift.
- 100dvh behaves correctly on Android browser chrome changes.

### Back to quick
- expanded owner leaves.
- body scroll restores to prior position.
- quick draft remains.
- user returns to the same normal Wellness position.

### Complete expanded
- one DB INSERT remains unchanged.
- expanded owner resolves into return without flashing the underlying page.
- production remains untouched until separate approval.

## Candidate verdict

The screenshots expose a shell-ownership defect, not a Wellness engine defect.

The current five-screen expanded interaction can remain.

The next implementation should repair only:
1. expanded mounting boundary;
2. one-scroll-context shell;
3. body scroll lock;
4. bottom-nav suppression during expanded ownership;
5. expanded header/content/footer layout.

No DB, write-hook, quick-path, Today, Goals, Money, Support, or Trust Engine changes are required.

## Next gate

Review/approve the **Wellness viewport-ownership repair candidate**.

If approved, next gate is preview-branch implementation only, followed by build and phone test. No DB change and no production merge.
