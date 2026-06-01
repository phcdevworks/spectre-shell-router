import { describe, expect, it, vi, beforeEach } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router Audit Tests", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/")
    document.body.innerHTML = ""
  })

  it("keeps currentPath in sync even when no route matches (404)", async () => {
    const { Router } = await import("../src/index")
    const routes = [{ path: "/", loader: async () => ({ render: vi.fn() }) }]
    const root = document.createElement("div")
    const router = new Router(routes, root)
    await tick()

    router.navigate("/404")
    await tick()

    // Access private property for audit purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((router as any).currentPath).toBe("/404")
    router.destroy()
  })

  it("updates URL correctly when navigation is cancelled by guard", async () => {
    const { Router } = await import("../src/index")
    const routes = [
      { path: "/", loader: async () => ({ render: vi.fn() }) },
      { path: "/blocked", loader: async () => ({ render: vi.fn() }) }
    ]
    const root = document.createElement("div")
    const router = new Router(routes, root, {
      beforeNavigate: (ctx, next) => {
        if (ctx.to === "/blocked") return // Cancel
        next()
      }
    })
    await tick()

    router.navigate("/blocked")
    await tick()

    // If navigation is cancelled, the URL should ideally not change, or be reverted.
    // Let's see what it currently does.
    expect(window.location.pathname).toBe("/")
    router.destroy()
  })

  it("matches static routes with special characters correctly", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/about us", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    const router = new Router(routes, root)

    router.navigate("/about%20us")
    await tick()

    expect(render).toHaveBeenCalled()
    router.destroy()
  })

  it("handles hash mode initial navigation with empty hash", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/", loader: async () => ({ render }) }]
    const root = document.createElement("div")

    window.location.hash = ""
    const router = new Router(routes, root, { mode: "hash" })
    await tick()

    expect(render).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((router as any).currentPath).toBe("/")
    router.destroy()
  })

  it("handles hash mode initial navigation with just #", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/", loader: async () => ({ render }) }]
    const root = document.createElement("div")

    window.location.hash = "#"
    const router = new Router(routes, root, { mode: "hash" })
    await tick()

    expect(render).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((router as any).currentPath).toBe("/")
    router.destroy()
  })
})
