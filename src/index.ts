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
  pattern: URLPattern
  loader: () => Promise<PageModule>
}

const routes: Route[] = []
let currentPage: PageModule | null = null
let rootEl: HTMLElement

export function registerRoute(
  path: string,
  loader: () => Promise<PageModule>
) {
  routes.push({
    pattern: new URLPattern({ pathname: path }),
    loader
  })
}

export function navigate(path: string) {
  history.pushState({}, "", path)
  handleNavigation()
}

export function startRouter(options: { root: HTMLElement }) {
  rootEl = options.root
  window.addEventListener("popstate", handleNavigation)
  handleNavigation()
}

async function handleNavigation() {
  const url = new URL(window.location.href)

  for (const route of routes) {
    const match = route.pattern.exec({ pathname: url.pathname })
    if (!match) continue

    if (currentPage?.destroy) {
      currentPage.destroy()
    }

    const page = await route.loader()
    currentPage = page

    page.render({
      path: url.pathname,
      params: match.pathname.groups,
      query: url.searchParams,
      root: rootEl
    })

    return
  }
}
