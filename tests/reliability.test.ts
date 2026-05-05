import { describe, expect, it, vi, beforeEach } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router Reliability Tests", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/")
    document.body.innerHTML = ""
  })

  it("handles loader failure gracefully", async () => {
    const { Router } = await import("../src/index")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const routes = [
      {
        path: "/fail",
        loader: async () => { throw new Error("Load failed") }
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

    expect(consoleSpy).toHaveBeenCalledWith("Error loading route:", expect.any(Error))
    expect(root.innerHTML).toBe("")

    router.destroy()
    consoleSpy.mockRestore()
  })

  it("handles destroy hook failure gracefully", async () => {
    const { Router } = await import("../src/index")
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

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

    expect(consoleSpy).toHaveBeenCalledWith("Error destroying page:", expect.any(Error))
    expect(root.innerHTML).toBe("Next")

    router.destroy()
    consoleSpy.mockRestore()
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
    // Should still be called (or not called if it's the same route, but current implementation re-renders on every navigate)
    // Actually handleNavigation checks if navId changed, and matchRoute is called.
    // If it matches, it re-renders.
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
