import { describe, expect, it, vi, beforeEach } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router Reliability Tests", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/")
    document.body.innerHTML = ""
  })

  it("clears the root when a loader throws", async () => {
    const { Router } = await import("../src/index")

    const routes = [
      {
        path: "/fail",
        loader: async (): Promise<never> => { throw new Error("Load failed") }
      },
      {
        path: "/",
        loader: async () => ({ render: (ctx) => { ctx.root.innerHTML = "Home" } })
      }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)
    await tick()
    expect(root.innerHTML).toBe("Home")

    router.navigate("/fail")
    await tick()

    // Root is cleared when the loader throws — stale content is not left on screen.
    expect(root.innerHTML).toBe("")

    router.destroy()
  })

  it("completes navigation even when the outgoing page's destroy hook throws", async () => {
    const { Router } = await import("../src/index")

    const routes = [
      {
        path: "/",
        loader: async () => ({
          render: (ctx) => { ctx.root.innerHTML = "Home" },
          destroy: () => { throw new Error("Destroy failed") }
        })
      },
      {
        path: "/next",
        loader: async () => ({
          render: (ctx) => { ctx.root.innerHTML = "Next" }
        })
      }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)
    await tick()
    expect(root.innerHTML).toBe("Home")

    router.navigate("/next")
    await tick()

    // Navigation must complete despite the throwing destroy hook.
    expect(root.innerHTML).toBe("Next")

    router.destroy()
  })

  it("handles trailing slashes consistently in route matching", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/about", loader: async () => ({ render }) }]
    const root = document.createElement("div")

    const router = new Router(routes, root)

    router.navigate("/about/")
    await tick()
    expect(render).toHaveBeenCalledTimes(1)

    router.navigate("/about")
    await tick()
    expect(render).toHaveBeenCalledTimes(2)

    router.destroy()
  })

  it("handles rapid popstate events (back/forward) correctly", async () => {
    const { Router } = await import("../src/index")
    const renderCalls: string[] = []

    const routes = [
      { path: "/1", loader: async () => { await tick(); return { render: () => renderCalls.push("1") } } },
      { path: "/2", loader: async () => { await tick(); return { render: () => renderCalls.push("2") } } },
      { path: "/3", loader: async () => { await tick(); return { render: () => renderCalls.push("3") } } }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)

    // Simulate rapid back/forward
    window.history.pushState({}, "", "/1")
    window.dispatchEvent(new PopStateEvent("popstate"))
    window.history.pushState({}, "", "/2")
    window.dispatchEvent(new PopStateEvent("popstate"))
    window.history.pushState({}, "", "/3")
    window.dispatchEvent(new PopStateEvent("popstate"))

    await new Promise(r => setTimeout(r, 50))

    expect(renderCalls).toEqual(["3"])
    router.destroy()
  })
})
