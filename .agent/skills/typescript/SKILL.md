---
name: sensory_specialist
description: "Master of framework-agnostic routing and lifecycle management."
---

# 📡 5. The Sensory Specialist (Layer 5)
Task: Open @phcdevworks/spectre-shell-router.

READ: SKILL.md -> LAYER 5: PENDING ROUTER UPDATES.

PRIORITY: Provide minimal, framework-agnostic routing and lifecycle management.

ACTION: Update Router logic in src/router.ts.

FAIL: If a new UI style or token is needed, output a 🛑 CONSTRAINT TRIGGERED block for Layer 1 or 2.

SUCCESS: Clear the "PENDING" block in SKILL.md when done.

## Core Directives for Routing Architecture

1. **The Sensory Layer**: Map URLs to page loaders and ensure the `render`/`destroy` contract is strictly followed.
2. **Routing is a utility, not a framework**: You are strictly legacy-forbidden from defining UI styles or managing global application state (other than URL state).
3. **Minimal Surface Area**: The `Router` class should remain lean. Avoid adding features like middleware unless requested.
4. **Lifecycle Enforcement**: Guarantee that every page module's `destroy()` hook is called before a new `render()` hook.

## LAYER 5: PENDING ROUTER UPDATES
- [ ] No pending updates.
