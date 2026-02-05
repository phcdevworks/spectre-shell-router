import { describe, expect, it, vi } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("spectre-shell-router", () => {
  it("throws if navigate is called before startRouter", async () => {
    vi.resetModules()
    const { navigate } = await import("../src/index")

    expect(() => navigate("/")).toThrow(
      "Router has not been started. Call startRouter() first."
    )
  })

  it("renders the matching route on start", async () => {
    vi.resetModules()
    const { registerRoute, startRouter } = await import("../src/index")

    const render = vi.fn()
    registerRoute("/", async () => ({ render }))

    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    startRouter({ root })
    await tick()

    expect(render).toHaveBeenCalledOnce()
  })

  it("passes params and query to the page module", async () => {
    vi.resetModules()
    const { registerRoute, startRouter, navigate } = await import("../src/index")

    const render = vi.fn()
    registerRoute("/users/:id", async () => ({ render }))

    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")
    startRouter({ root })
    await tick()

    navigate("/users/42?tab=info")
    await tick()

    expect(render).toHaveBeenCalled()
    const ctx = render.mock.calls.at(-1)?.[0]
    expect(ctx?.params.id).toBe("42")
    expect(ctx?.query.get("tab")).toBe("info")
    expect(ctx?.path).toBe("/users/42")
    expect(ctx?.root).toBe(root)
  })

  it("calls destroy on the previous page when navigating", async () => {
    vi.resetModules()
    const { registerRoute, startRouter, navigate } = await import("../src/index")

    const destroy = vi.fn()
    registerRoute("/", async () => ({ render: vi.fn(), destroy }))
    registerRoute("/next", async () => ({ render: vi.fn() }))

    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")
    startRouter({ root })
    await tick()

    navigate("/next")
    await tick()

    expect(destroy).toHaveBeenCalledOnce()
  })
})
