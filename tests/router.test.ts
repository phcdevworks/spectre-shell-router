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

  it("decodes encoded route params before exposing them in context", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/users/:id", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    await tick()

    router.navigate("/users/Brad%20Potts")
    await tick()

    const ctx = render.mock.calls.at(-1)?.[0]
    expect(ctx?.params.id).toBe("Brad Potts")
    expect(ctx?.path).toBe("/users/Brad%20Potts")
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

  it("intercepts same-domain link clicks", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/about", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)

    // Create a link and click it
    const link = document.createElement("a")
    link.href = "/about"
    document.body.appendChild(link)

    link.click()
    await tick()

    expect(window.location.pathname).toBe("/about")
    expect(render).toHaveBeenCalled()

    router.destroy()
    document.body.removeChild(link)
  })

  it("does not intercept modifier-key link clicks", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/about", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    const link = document.createElement("a")
    link.href = "/about"
    document.body.appendChild(link)

    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true
    })

    let preventedByRouter = true
    window.addEventListener("click", (click) => {
      preventedByRouter = click.defaultPrevented
      // Observe the router first, then prevent jsdom's unsupported document navigation.
      click.preventDefault()
    }, { once: true })
    link.dispatchEvent(event)
    await tick()

    expect(preventedByRouter).toBe(false)
    expect(window.location.pathname).toBe("/")
    expect(render).not.toHaveBeenCalled()

    router.destroy()
    document.body.removeChild(link)
  })

  it("handles 404 by clearing the root element", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn((ctx) => {
      ctx.root.innerHTML = "Loaded"
    })
    const routes = [{ path: "/", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    await tick()
    expect(root.innerHTML).toBe("Loaded")

    router.navigate("/non-existent")
    await tick()

    expect(root.innerHTML).toBe("")
    router.destroy()
  })

  it("removes event listeners on destroy", async () => {
    const { Router } = await import("../src/index")
    const render = vi.fn()
    const routes = [{ path: "/foo", loader: async () => ({ render }) }]
    const root = document.createElement("div")
    window.history.replaceState({}, "", "/")

    const router = new Router(routes, root)
    router.destroy()

    // Navigate after destroy
    window.history.pushState({}, "", "/foo")
    window.dispatchEvent(new PopStateEvent("popstate"))
    await tick()

    expect(render).not.toHaveBeenCalled()
  })

  describe("beforeNavigate guard", () => {
    it("allows navigation when next() is called without a redirect", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/guarded", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, {
        beforeNavigate: (_ctx, next) => { next() },
      })
      router.navigate("/guarded")
      await tick()

      expect(render).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("cancels navigation when next() is never called", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn((ctx) => { ctx.root.innerHTML = "home" }) }) },
        { path: "/blocked", loader: async () => ({ render }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, {
        beforeNavigate: (_ctx, _next) => { /* intentionally not calling next */ },
      })
      await tick()
      root.innerHTML = "home"

      router.navigate("/blocked")
      await tick()

      expect(render).not.toHaveBeenCalled()
      router.destroy()
    })

    it("redirects navigation when next() is called with a path", async () => {
      const { Router } = await import("../src/index")
      const renderBlocked = vi.fn()
      const renderTarget = vi.fn()
      const routes = [
        { path: "/blocked", loader: async () => ({ render: renderBlocked }) },
        { path: "/target", loader: async () => ({ render: renderTarget }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, {
        beforeNavigate: (ctx, next) => { next(ctx.to === "/blocked" ? "/target" : undefined) },
      })
      router.navigate("/blocked")
      await tick()
      await tick()

      expect(renderBlocked).not.toHaveBeenCalled()
      expect(renderTarget).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("passes correct from/to context to the guard", async () => {
      const { Router } = await import("../src/index")
      const guardCtxs: Array<{ from: string | null; to: string }> = []
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/about", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, {
        beforeNavigate: (ctx, next) => { guardCtxs.push({ from: ctx.from, to: ctx.to }); next() },
      })
      await tick()

      router.navigate("/about")
      await tick()

      expect(guardCtxs[0]).toEqual({ from: null, to: "/" })
      expect(guardCtxs[1]).toEqual({ from: "/", to: "/about" })
      router.destroy()
    })
  })

  describe("hash mode", () => {
    it("renders the matching route on start in hash mode", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      await tick()

      expect(render).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("navigates to a hash route", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/about", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      router.navigate("/about")
      await tick()

      expect(render).toHaveBeenCalledOnce()
      expect(window.location.hash).toBe("#/about")
      router.destroy()
    })

    it("passes params and query to the page module in hash mode", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/users/:id", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      router.navigate("/users/42?tab=info")
      await tick()

      const ctx = render.mock.calls.at(-1)?.[0]
      expect(ctx?.params.id).toBe("42")
      expect(ctx?.query.get("tab")).toBe("info")
      expect(ctx?.path).toBe("/users/42")
      router.destroy()
    })

    it("intercepts hash links in hash mode", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/about", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })

      const link = document.createElement("a")
      link.href = "#/about"
      document.body.appendChild(link)

      link.click()
      await tick()

      expect(render).toHaveBeenCalledOnce()
      router.destroy()
      document.body.removeChild(link)
    })

    it("does not intercept plain anchor links in hash mode", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      await tick()
      render.mockClear()

      const link = document.createElement("a")
      link.href = "#section"
      document.body.appendChild(link)

      link.click()
      await tick()

      expect(render).not.toHaveBeenCalled()
      router.destroy()
      document.body.removeChild(link)
    })

    it("fires hashchange handler for external hash navigation", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/about", loader: async () => ({ render }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      await tick()

      window.history.replaceState({}, "", "#/about")
      window.dispatchEvent(new HashChangeEvent("hashchange"))
      await tick()

      expect(render).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("removes hashchange listener on destroy", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/about", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      router.destroy()

      window.history.replaceState({}, "", "#/about")
      window.dispatchEvent(new HashChangeEvent("hashchange"))
      await tick()

      expect(render).not.toHaveBeenCalled()
    })
  })

  describe("scroll restoration", () => {
    it("scrolls to top on forward navigation", async () => {
      const { Router } = await import("../src/index")
      const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/about", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()
      scrollTo.mockClear()

      router.navigate("/about")
      await tick()

      expect(scrollTo).toHaveBeenCalledWith(0, 0)
      router.destroy()
      scrollTo.mockRestore()
    })

    it("restores saved scroll position on back/forward navigation", async () => {
      const { Router } = await import("../src/index")
      const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/about", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()
      scrollTo.mockClear()

      // Simulate a popstate (back/forward) with a saved scroll position in state
      window.history.replaceState({ scrollY: 350 }, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
      await tick()

      expect(scrollTo).toHaveBeenCalledWith(0, 350)
      router.destroy()
      scrollTo.mockRestore()
    })

    it("scrolls to top when popstate state has no saved scroll", async () => {
      const { Router } = await import("../src/index")
      const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      const routes = [{ path: "/", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()
      scrollTo.mockClear()

      window.history.replaceState({}, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
      await tick()

      expect(scrollTo).toHaveBeenCalledWith(0, 0)
      router.destroy()
      scrollTo.mockRestore()
    })

    it("does not scroll when scrollRestoration is disabled", async () => {
      const { Router } = await import("../src/index")
      const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/about", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { scrollRestoration: false })
      await tick()
      scrollTo.mockClear()

      router.navigate("/about")
      await tick()

      expect(scrollTo).not.toHaveBeenCalled()
      router.destroy()
      scrollTo.mockRestore()
    })
  })

  describe("router.href()", () => {
    it("generates a path for a static named route", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ name: "home", path: "/", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      expect(router.href("home")).toBe("/")
      router.destroy()
    })

    it("substitutes params for a parameterized named route", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ name: "user", path: "/users/:id", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      expect(router.href("user", { id: "42" })).toBe("/users/42")
      router.destroy()
    })

    it("encodes special characters in params", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ name: "user", path: "/users/:id", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      expect(router.href("user", { id: "Brad Potts" })).toBe("/users/Brad%20Potts")
      router.destroy()
    })

    it("throws for an unknown route name", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ path: "/", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      expect(() => router.href("missing")).toThrow('No route named "missing"')
      router.destroy()
    })

    it("throws when a required param is missing", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ name: "user", path: "/users/:id", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      expect(() => router.href("user")).toThrow('Missing param "id"')
      router.destroy()
    })

    it("returns a hash-prefixed path in hash mode", async () => {
      const { Router } = await import("../src/index")
      const routes = [
        { name: "home", path: "/", loader: async () => ({ render: vi.fn() }) },
        { name: "user", path: "/users/:id", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      expect(router.href("home")).toBe("#/")
      expect(router.href("user", { id: "42" })).toBe("#/users/42")
      router.destroy()
    })
  })

  describe("router.subscribe()", () => {
    it("notifies subscribers with the route context after each completed navigation", async () => {
      const { Router } = await import("../src/index")
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/users/:id", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()

      const subscriber = vi.fn()
      router.subscribe(subscriber)

      router.navigate("/users/42?tab=info")
      await tick()

      expect(subscriber).toHaveBeenCalledOnce()
      const ctx = subscriber.mock.calls.at(-1)?.[0]
      expect(ctx?.path).toBe("/users/42")
      expect(ctx?.params.id).toBe("42")
      expect(ctx?.query.get("tab")).toBe("info")
      expect(ctx?.root).toBe(root)
      router.destroy()
    })

    it("returns an unsubscribe function that stops further notifications", async () => {
      const { Router } = await import("../src/index")
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/next", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()

      const subscriber = vi.fn()
      const unsubscribe = router.subscribe(subscriber)
      unsubscribe()

      router.navigate("/next")
      await tick()

      expect(subscriber).not.toHaveBeenCalled()
      router.destroy()
    })

    it("does not notify subscribers when no route matches", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ path: "/", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()

      const subscriber = vi.fn()
      router.subscribe(subscriber)

      router.navigate("/missing")
      await tick()

      expect(subscriber).not.toHaveBeenCalled()
      router.destroy()
    })
  })

  describe("navigation start/end hooks", () => {
    it("fires onNavigationStart and onNavigationEnd around each navigation", async () => {
      const { Router } = await import("../src/index")
      const onNavigationStart = vi.fn()
      const onNavigationEnd = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/next", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { onNavigationStart, onNavigationEnd })
      await tick()

      expect(onNavigationStart).toHaveBeenCalledWith({ from: null, to: "/" })
      expect(onNavigationEnd).toHaveBeenCalledWith({ from: null, to: "/" })

      onNavigationStart.mockClear()
      onNavigationEnd.mockClear()

      router.navigate("/next")
      await tick()

      expect(onNavigationStart).toHaveBeenCalledWith({ from: "/", to: "/next" })
      expect(onNavigationEnd).toHaveBeenCalledWith({ from: "/", to: "/next" })
      router.destroy()
    })

    it("fires onNavigationEnd even when no route matches or the loader throws", async () => {
      const { Router } = await import("../src/index")
      const onNavigationStart = vi.fn()
      const onNavigationEnd = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/broken", loader: async () => { throw new Error("boom") } },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { onNavigationStart, onNavigationEnd })
      await tick()
      onNavigationStart.mockClear()
      onNavigationEnd.mockClear()

      router.navigate("/missing")
      await tick()
      expect(onNavigationStart).toHaveBeenCalledTimes(1)
      expect(onNavigationEnd).toHaveBeenCalledTimes(1)

      onNavigationStart.mockClear()
      onNavigationEnd.mockClear()

      router.navigate("/broken")
      await tick()
      expect(onNavigationStart).toHaveBeenCalledTimes(1)
      expect(onNavigationEnd).toHaveBeenCalledTimes(1)
      router.destroy()
    })
  })

  describe("route meta", () => {
    it("exposes a route's meta object on the route context", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [
        { path: "/", meta: { title: "Home" }, loader: async () => ({ render: vi.fn() }) },
        { path: "/users/:id", meta: { title: "User", requiresAuth: true }, loader: async () => ({ render }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()

      router.navigate("/users/42")
      await tick()

      const ctx = render.mock.calls.at(-1)?.[0]
      expect(ctx?.meta).toEqual({ title: "User", requiresAuth: true })
      router.destroy()
    })

    it("leaves meta undefined for routes without a meta object", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()

      const ctx = render.mock.calls.at(-1)?.[0]
      expect(ctx?.meta).toBeUndefined()
      router.destroy()
    })
  })

  describe("afterNavigate hook", () => {
    it("fires with the route context after render completes", async () => {
      const { Router } = await import("../src/index")
      const afterNavigate = vi.fn()
      const routes = [
        { path: "/", meta: { title: "Home" }, loader: async () => ({ render: vi.fn() }) },
        { path: "/users/:id", loader: async () => ({ render: vi.fn() }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { afterNavigate })
      await tick()

      expect(afterNavigate).toHaveBeenCalledOnce()
      let ctx = afterNavigate.mock.calls.at(-1)?.[0]
      expect(ctx?.path).toBe("/")
      expect(ctx?.meta).toEqual({ title: "Home" })

      afterNavigate.mockClear()
      router.navigate("/users/42?tab=info")
      await tick()

      expect(afterNavigate).toHaveBeenCalledOnce()
      ctx = afterNavigate.mock.calls.at(-1)?.[0]
      expect(ctx?.path).toBe("/users/42")
      expect(ctx?.params.id).toBe("42")
      expect(ctx?.query.get("tab")).toBe("info")
      router.destroy()
    })

    it("does not fire when no route matches or the loader throws", async () => {
      const { Router } = await import("../src/index")
      const afterNavigate = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/broken", loader: async () => { throw new Error("boom") } },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { afterNavigate })
      await tick()
      afterNavigate.mockClear()

      router.navigate("/missing")
      await tick()
      expect(afterNavigate).not.toHaveBeenCalled()

      router.navigate("/broken")
      await tick()
      expect(afterNavigate).not.toHaveBeenCalled()
      router.destroy()
    })
  })

  describe("router.replace()", () => {
    it("navigates without adding a new history entry", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [
        { path: "/", loader: async () => ({ render: vi.fn() }) },
        { path: "/next", loader: async () => ({ render }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root)
      await tick()
      const lengthBefore = window.history.length

      router.replace("/next")
      await tick()

      expect(render).toHaveBeenCalledOnce()
      expect(window.location.pathname).toBe("/next")
      expect(window.history.length).toBe(lengthBefore)
      router.destroy()
    })

    it("uses a hash-prefixed URL in hash mode", async () => {
      const { Router } = await import("../src/index")
      const render = vi.fn()
      const routes = [{ path: "/about", loader: async () => ({ render }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const router = new Router(routes, root, { mode: "hash" })
      router.replace("/about")
      await tick()

      expect(render).toHaveBeenCalledOnce()
      expect(window.location.hash).toBe("#/about")
      router.destroy()
    })
  })

  describe("router.back() and router.forward()", () => {
    it("delegates to the History API", async () => {
      const { Router } = await import("../src/index")
      const routes = [{ path: "/", loader: async () => ({ render: vi.fn() }) }]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/")

      const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
      const forward = vi.spyOn(window.history, "forward").mockImplementation(() => {})

      const router = new Router(routes, root)
      router.back()
      router.forward()

      expect(back).toHaveBeenCalledOnce()
      expect(forward).toHaveBeenCalledOnce()

      router.destroy()
      back.mockRestore()
      forward.mockRestore()
    })
  })

  describe("nested routing", () => {
    it("renders a parent layout and its matching child into the [data-router-outlet]", async () => {
      const { Router } = await import("../src/index")
      const parentRender = vi.fn((ctx) => {
        ctx.root.innerHTML = '<header>layout</header><main data-router-outlet></main>'
      })
      const childRender = vi.fn()
      const routes = [
        {
          path: "/app",
          loader: async () => ({ render: parentRender }),
          routes: [{ path: "profile", loader: async () => ({ render: childRender }) }],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app/profile")

      const router = new Router(routes, root)
      await tick()

      expect(parentRender).toHaveBeenCalledOnce()
      expect(childRender).toHaveBeenCalledOnce()
      const childCtx = childRender.mock.calls.at(-1)?.[0]
      expect(childCtx?.root.hasAttribute("data-router-outlet")).toBe(true)
      router.destroy()
    })

    it("matches an empty child path as the index route", async () => {
      const { Router } = await import("../src/index")
      const parentRender = vi.fn((ctx) => {
        ctx.root.innerHTML = '<main data-router-outlet></main>'
      })
      const indexRender = vi.fn()
      const routes = [
        {
          path: "/app",
          loader: async () => ({ render: parentRender }),
          routes: [{ path: "", loader: async () => ({ render: indexRender }) }],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app")

      const router = new Router(routes, root)
      await tick()

      expect(parentRender).toHaveBeenCalledOnce()
      expect(indexRender).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("merges ancestor and child params into the child's context", async () => {
      const { Router } = await import("../src/index")
      const parentRender = vi.fn((ctx) => {
        ctx.root.innerHTML = '<main data-router-outlet></main>'
      })
      const childRender = vi.fn()
      const routes = [
        {
          path: "/orgs/:orgId",
          loader: async () => ({ render: parentRender }),
          routes: [{ path: "members/:memberId", loader: async () => ({ render: childRender }) }],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/orgs/42/members/7")

      const router = new Router(routes, root)
      await tick()

      const childCtx = childRender.mock.calls.at(-1)?.[0]
      expect(childCtx?.params).toEqual({ orgId: "42", memberId: "7" })
      router.destroy()
    })

    it("keeps the parent layout mounted (not re-rendered) when navigating between sibling children", async () => {
      const { Router } = await import("../src/index")
      const parentDestroy = vi.fn()
      const parentRender = vi.fn((ctx) => {
        ctx.root.innerHTML = '<main data-router-outlet></main>'
      })
      const childADestroy = vi.fn()
      const childBRender = vi.fn()
      const routes = [
        {
          path: "/app",
          loader: async () => ({ render: parentRender, destroy: parentDestroy }),
          routes: [
            { path: "a", loader: async () => ({ render: vi.fn(), destroy: childADestroy }) },
            { path: "b", loader: async () => ({ render: childBRender }) },
          ],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app/a")

      const router = new Router(routes, root)
      await tick()
      expect(parentRender).toHaveBeenCalledOnce()

      router.navigate("/app/b")
      await tick()

      expect(parentRender).toHaveBeenCalledOnce()
      expect(parentDestroy).not.toHaveBeenCalled()
      expect(childADestroy).toHaveBeenCalledOnce()
      expect(childBRender).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("destroys the whole chain when navigating away from the parent entirely", async () => {
      const { Router } = await import("../src/index")
      const parentDestroy = vi.fn()
      const parentRender = vi.fn((ctx) => {
        ctx.root.innerHTML = '<main data-router-outlet></main>'
      })
      const otherRender = vi.fn()
      const routes = [
        {
          path: "/app",
          loader: async () => ({ render: parentRender, destroy: parentDestroy }),
          routes: [{ path: "a", loader: async () => ({ render: vi.fn() }) }],
        },
        { path: "/other", loader: async () => ({ render: otherRender }) },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app/a")

      const router = new Router(routes, root)
      await tick()

      router.navigate("/other")
      await tick()

      expect(parentDestroy).toHaveBeenCalledOnce()
      expect(otherRender).toHaveBeenCalledOnce()
      router.destroy()
    })

    it("reports onError and clears the outlet when a parent renders without a [data-router-outlet]", async () => {
      const { Router } = await import("../src/index")
      const onError = vi.fn()
      const childRender = vi.fn()
      const routes = [
        {
          path: "/app",
          loader: async () => ({ render: vi.fn() }),
          routes: [{ path: "a", loader: async () => ({ render: childRender }) }],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app/a")

      const router = new Router(routes, root, { onError })
      await tick()

      expect(onError).toHaveBeenCalledOnce()
      expect(childRender).not.toHaveBeenCalled()
      router.destroy()
    })

    it("supports named routes for nested children via router.href()", async () => {
      const { Router } = await import("../src/index")
      const routes = [
        {
          path: "/app",
          loader: async () => ({
            render: (ctx: { root: HTMLElement }) => {
              ctx.root.innerHTML = '<main data-router-outlet></main>'
            },
          }),
          routes: [
            { path: "profile", name: "profile", loader: async () => ({ render: vi.fn() }) },
          ],
        },
      ]
      const root = document.createElement("div")
      window.history.replaceState({}, "", "/app")

      const router = new Router(routes, root)
      await tick()

      expect(router.href("profile")).toBe("/app/profile")
      router.destroy()
    })
  })
})
