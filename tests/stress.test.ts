import { describe, expect, it, vi, beforeEach } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router Stress Test Suite", () => {
  beforeEach(() => {
    // Reset location and history for each test
    window.history.replaceState({}, "", "/")
    document.body.innerHTML = ""
  })

  it("handles rapid-fire navigations through race condition protection", async () => {
    const { Router } = await import("../src/index")
    const renderCalls: string[] = []

    const routes = [
      {
        path: "/r1",
        loader: async () => {
          await new Promise(r => setTimeout(r, 50))
          return { render: () => { renderCalls.push("r1") } }
        }
      },
      {
        path: "/r2",
        loader: async () => {
          await new Promise(r => setTimeout(r, 10))
          return { render: () => { renderCalls.push("r2") } }
        }
      },
      {
        path: "/r3",
        loader: async () => {
          return { render: () => { renderCalls.push("r3") } }
        }
      }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)

    router.navigate("/r1")
    router.navigate("/r2")
    router.navigate("/r3")

    await new Promise(r => setTimeout(r, 100))

    expect(renderCalls).toEqual(["r3"])
    router.destroy()
  })

  it("ensures overlapping navigation attempts resolve to the final route", async () => {
    const { Router } = await import("../src/index")
    const renderCount = vi.fn()
    const routes = [
      {
        path: "/:id",
        loader: async () => {
          await new Promise(r => setTimeout(r, Math.random() * 20))
          return { render: (ctx) => renderCount(ctx.params.id) }
        }
      }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)

    for (let i = 0; i < 50; i++) {
      router.navigate(`/${i}`)
    }

    await new Promise(r => setTimeout(r, 300))

    expect(renderCount).toHaveBeenCalledTimes(1)
    expect(renderCount).toHaveBeenCalledWith("49")
    router.destroy()
  })

  it("handles back transitions correctly", async () => {
    const { Router } = await import("../src/index")
    const renderCalls: string[] = []
    const routes = [
      { path: "/", loader: async () => ({ render: () => renderCalls.push("root") }) },
      { path: "/a", loader: async () => ({ render: () => renderCalls.push("a") }) }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)
    await tick()

    router.navigate("/a")
    await tick()
    expect(renderCalls.at(-1)).toBe("a")

    // In JSDOM, we need to manually trigger popstate and ensure location is what we expect
    window.history.pushState({}, "", "/")
    window.dispatchEvent(new PopStateEvent("popstate"))

    await tick()
    expect(renderCalls.at(-1)).toBe("root")
    router.destroy()
  })

  it("extracts complex path parameters correctly", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [
      { path: "/org/:orgId/project/:projectId/task/:taskId", loader: async () => ({ render }) }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root)

    const complexPath = "/org/phc/project/spectre/task/audit-42"
    router.navigate(complexPath)
    await tick()

    expect(render).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        orgId: "phc",
        projectId: "spectre",
        taskId: "audit-42"
      }
    }))
    router.destroy()
  })

  it("handles query-heavy route changes correctly", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/search", loader: async () => ({ render }) }]

    const root = document.createElement("div")
    const router = new Router(routes, root)

    const queryPath = "/search?q=spectre&category=audit&sort=desc&limit=100&offset=0"
    router.navigate(queryPath)
    await tick()

    expect(render).toHaveBeenCalled()
    const ctx = render.mock.calls[0][0]
    expect(ctx.query.get("q")).toBe("spectre")
    expect(ctx.query.get("category")).toBe("audit")
    expect(ctx.query.get("sort")).toBe("desc")
    expect(ctx.query.get("limit")).toBe("100")

    router.destroy()
  })
})
