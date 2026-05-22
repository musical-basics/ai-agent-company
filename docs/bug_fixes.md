# 🩺 SwarmOS Bug Fix Log

This log documents all complex bugs that required more than 2 attempts to resolve, cataloging the root causes, unsuccessful attempts, and final solutions per our engineering rules.

---

## 📋 Template for New Entries

```markdown
## [BUG-ID] Short Title

- **Date**: YYYY-MM-DD
- **Affected Files**: list of files
- **Attempts Made**:
  1. *First Attempt*: What we tried and why it failed.
  2. *Second Attempt*: What we tried and why it failed.
- **Root Cause**: Deep technical explanation of the failure mode.
- **Final Solution**: What worked and why it is a robust process-level fix.
```

---

## 📝 Log Entries

## [BUG-001] React Flow Canvas Blank / Infinite Render Loop on Mount

- **Date**: 2026-05-22
- **Affected Files**:
  - [canvas-builder.tsx](file:///Users/lionelyu/Documents/New%20Version/ai-agent-company/meta_repo/components/canvas-builder.tsx)
  - [page.tsx](file:///Users/lionelyu/Documents/New%20Version/ai-agent-company/meta_repo/app/page.tsx)
- **Attempts Made**:
  1. *First Attempt*: Fired `fitView()` immediately after Zustand persistence rehydration. This failed to display the canvas since the DOM element heights were collapsed, preventing node rendering and causing layout issues.
  2. *Second Attempt*: Wrapped/unwrapped the component inside standard `ReactFlowProvider` elements, which did not resolve the blank screen. It also collapsed the React Flow component's wrapper container due to a height-calculation mismatch inside the flex layouts.
  3. *Third Attempt*: Applied styling adjustments, establishing absolute positioning (`position: absolute; inset: 0`) within a relative layout parent container to prevent height collapse. The canvas mounted but remained unresponsive and blank because of infinite React re-renders.
  4. *Fourth Attempt*: Monitored render cycles and discovered that React Flow internal measurements triggered `'dimensions'` type change events. Because the change handlers (`onNodesChange`, `onEdgesChange`) depended on `rfNodes`/`rfEdges` in the `useCallback` dependency arrays, every state update from Zustand created a fresh array reference, creating an infinite loop.
- **Root Cause**:
  - *Dependency Loop in Callbacks*: The React Flow node changes are received by `onNodesChange`. When the canvas measures nodes (firing `dimensions` type changes), updating the store causes the parent component to re-render. This re-render creates a new `rfNodes` array instance. Because `rfNodes` was in the dependency list of `onNodesChange`, the callback reference was updated, forcing React Flow to run internal measurements again, re-firing the callback and looping infinitely.
  - *Layout Height Collapse*: React Flow requires explicit height/width settings. Using it inside unstyled wrappers (like raw providers in certain layouts) collapses it to `0px` height.
- **Final Solution**:
  1. Imperatively retrieve node/edge snapshots using `useSwarmStore.getState()` inside the callbacks instead of relying on the reactive component state dependency array. This keeps the `useCallback` hooks' dependency arrays stable and containing only the store setter functions (`setNodes`, `setEdges`).
  2. Ignore `'dimensions'` events in the event dispatcher/setter to prevent internal measurement events from triggering unnecessary state synchronization updates back into Zustand.
  3. Explicitly wrap the canvas layout in a relative, overflow-hidden container with `position: absolute; inset: 0` to preserve the layout within the flex parent.
