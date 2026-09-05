import type { RouteContext } from "../src/index"
import { describe, expect, it, beforeEach } from "vitest"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe("Router basePath support", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("strips the basePath from the URL when matching routes", async () => {
    const { Router } = await import("../src/index")
    window.history.replaceState({}, "", "/portal/users/42")

    const routes = [
      {
        path: "/users/:id",
        loader: async () => ({
          render: (ctx: RouteContext) => { ctx.root.innerHTML = `user:${ctx.params.id}` }
        })
      }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root, { basePath: "/portal" })
    await tick()

    expect(root.innerHTML).toBe("user:42")

    router.destroy()
  })

  it("prefixes navigate()/replace() with the basePath", async () => {
    const { Router } = await import("../src/index")
    window.history.replaceState({}, "", "/portal")

    const routes = [
      { path: "/", loader: async () => ({ render: () => {} }) },
      { path: "/next", loader: async () => ({ render: () => {} }) }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root, { basePath: "/portal" })
    await tick()

    router.navigate("/next")
    await tick()
    expect(window.location.pathname).toBe("/portal/next")

    router.replace("/")
    await tick()
    expect(window.location.pathname).toBe("/portal")

    router.destroy()
  })

  it("prefixes href() with the basePath", async () => {
    const { Router } = await import("../src/index")
    window.history.replaceState({}, "", "/portal")

    const routes = [
      { path: "/", name: "home", loader: async () => ({ render: () => {} }) },
      { path: "/users/:id", name: "user", loader: async () => ({ render: () => {} }) }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root, { basePath: "/portal" })
    await tick()

    expect(router.href("home")).toBe("/portal")
    expect(router.href("user", { id: "7" })).toBe("/portal/users/7")

    router.destroy()
  })

  it("intercepts in-app link clicks under the basePath and ignores links outside it", async () => {
    const { Router } = await import("../src/index")
    window.history.replaceState({}, "", "/portal")

    const routes = [
      { path: "/", loader: async () => ({ render: () => {} }) },
      { path: "/next", loader: async () => ({ render: () => {} }) }
    ]

    const root = document.createElement("div")
    const router = new Router(routes, root, { basePath: "/portal" })
    await tick()

    const insideLink = document.createElement("a")
    insideLink.href = "/portal/next"
    document.body.appendChild(insideLink)

    insideLink.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }))
    await tick()
    expect(window.location.pathname).toBe("/portal/next")

    router.navigate("/")
    await tick()

    const outsideLink = document.createElement("a")
    outsideLink.href = "/other-app/page"
    document.body.appendChild(outsideLink)

    const outsideEvent = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })
    let preventedByRouter = true
    window.addEventListener("click", (click) => {
      preventedByRouter = click.defaultPrevented
      // Observe the router first, then prevent jsdom's unsupported document navigation.
      click.preventDefault()
    }, { once: true })
    outsideLink.dispatchEvent(outsideEvent)
    await tick()

    // Outside the basePath, the router must not intercept — default navigation was allowed through.
    expect(preventedByRouter).toBe(false)
    expect(window.location.pathname).toBe("/portal")

    router.destroy()
  })
})
