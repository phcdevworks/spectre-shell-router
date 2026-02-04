type PageModule = {
  render: (ctx: RouteContext) => void
  destroy?: () => void
}

export type RouteContext = {
  path: string
  params: Record<string, string>
  query: URLSearchParams
  root: HTMLElement
}

type Route = {
  path: string
  loader: () => Promise<PageModule>
}

const routes: Route[] = []
let currentPage: PageModule | null = null
let rootEl: HTMLElement | null = null

export function registerRoute(
  path: string,
  loader: () => Promise<PageModule>
) {
  routes.push({ path, loader })
}

export function navigate(path: string) {
  if (!rootEl) {
    throw new Error("Router has not been started. Call startRouter() first.")
  }

  history.pushState({}, "", path)
  handleNavigation()
}

export function startRouter(options: { root: HTMLElement }) {
  rootEl = options.root
  window.addEventListener("popstate", handleNavigation)
  handleNavigation()
}

async function handleNavigation() {
  if (!rootEl) return

  const url = new URL(window.location.href)

  for (const route of routes) {
    const params = matchRoute(route.path, url.pathname)
    if (!params) continue

    if (currentPage?.destroy) {
      currentPage.destroy()
    }

    rootEl.innerHTML = ""

    const page = await route.loader()
    currentPage = page

    page.render({
      path: url.pathname,
      params,
      query: url.searchParams,
      root: rootEl
    })

    return
  }
}

/**
 * Very small path matcher.
 * Supports static segments and `:param` segments.
 * Example: `/users/:id`
 */
function matchRoute(
  routePath: string,
  urlPath: string
): Record<string, string> | null {
  const routeParts = routePath.split("/").filter(Boolean)
  const urlParts = urlPath.split("/").filter(Boolean)

  if (routeParts.length !== urlParts.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i]
    const urlPart = urlParts[i]

    if (routePart.startsWith(":")) {
      params[routePart.slice(1)] = urlPart
    } else if (routePart !== urlPart) {
      return null
    }
  }

  return params
}
