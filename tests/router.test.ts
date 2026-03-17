import { describe, expect, it, vi } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("spectre-shell-router", () => {
  it("renders the matching route on start", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    await tick()

    expect(render).toHaveBeenCalledOnce()
    router.destroy()
  })

  it("passes params and query to the page module", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/users/:id", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    await tick()

    router.navigate("/users/42?tab=info")
    await tick()

    expect(render).toHaveBeenCalled()
    const ctx = render.mock.calls.at(-1)?.[0]
    expect(ctx?.params.id).toBe("42")
    expect(ctx?.query.get("tab")).toBe("info")
    expect(ctx?.path).toBe("/users/42")
    expect(ctx?.root).toBe(root)
    router.destroy()
  })

  it("calls destroy on the previous page when navigating", async () => {
    const { Router } = await import("../src/index")
    const destroy = vi.fn()
    const routes = [
      { path: "/", loader: async () => ({ render: vi.fn(), destroy }) },
      { path: "/next", loader: async () => ({ render: vi.fn() }) }
    ]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    await tick()

    router.navigate("/next")
    await tick()

    expect(destroy).toHaveBeenCalledOnce()
    router.destroy()
  })

  it("prevents race conditions", async () => {
    const { Router } = await import("../src/index")
    const render1 = vi.fn()
    const render2 = vi.fn()
    
    const routes = [
      { 
        path: "/1", 
        loader: async () => {
          await new Promise(r => setTimeout(r, 50))
          return { render: render1 }
        } 
      },
      { 
        path: "/2", 
        loader: async () => {
          return { render: render2 }
        } 
      }
    ]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)

    router.navigate("/1")
    router.navigate("/2")
    
    await new Promise(r => setTimeout(r, 150))

    expect(render2).toHaveBeenCalledOnce()
    expect(render1).not.toHaveBeenCalled()
    router.destroy()
  })
})
