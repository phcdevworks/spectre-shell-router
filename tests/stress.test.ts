import { describe, expect, it, vi } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router Rapid-Fire Navigation Stress Test", () => {
  it("ensures only the last navigation renders despite rapid changes", async () => {
    const { Router } = await import("../src/index")

    const renderCalls: string[] = []

    const routes = [
      {
        path: "/route1",
        loader: async () => {
          await new Promise(r => setTimeout(r, 50))
          return { render: () => { renderCalls.push("route1") } }
        }
      },
      {
        path: "/route2",
        loader: async () => {
          await new Promise(r => setTimeout(r, 20))
          return { render: () => { renderCalls.push("route2") } }
        }
      },
      {
        path: "/route3",
        loader: async () => {
          return { render: () => { renderCalls.push("route3") } }
        }
      }
    ]

    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")
    const router = new Router(routes, root)

    // Rapid fire navigations
    router.navigate("/route1")
    router.navigate("/route2")
    router.navigate("/route3")

    // Wait for all potential async loaders to settle
    await new Promise(r => setTimeout(r, 200))

    expect(renderCalls).toEqual(["route3"])
    router.destroy()
  })

  it("handles 100 rapid navigations without race conditions", async () => {
    const { Router } = await import("../src/index")

    const renderCount = vi.fn()
    const routes = [
      {
        path: "/:id",
        loader: async () => {
          // Randomized delay to simulate varied network/loading times
          await new Promise(r => setTimeout(r, Math.random() * 10))
          return { render: (ctx) => renderCount(ctx.params.id) }
        }
      }
    ]

    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")
    const router = new Router(routes, root)

    for (let i = 0; i < 100; i++) {
      router.navigate(`/${i}`)
    }

    await new Promise(r => setTimeout(r, 500))

    expect(renderCount).toHaveBeenCalledTimes(1)
    expect(renderCount).toHaveBeenCalledWith("99")
    router.destroy()
  })
})
