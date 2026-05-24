export type PageModule = {
  render: (ctx: RouteContext) => void
  destroy?: () => void
}

export type RouteContext = {
  path: string
  params: Record<string, string>
  query: URLSearchParams
  root: HTMLElement
}

export type Route = {
  path: string
  name?: string
  loader: () => Promise<PageModule>
}

export class Router {
  private routes: Route[]
  private rootEl: HTMLElement | null
  private currentPage: PageModule | null = null
  private handleNavigationBound: () => void
  private handleLinkClickBound: (e: MouseEvent) => void
  private currentNavId = 0
  private nameIndex: Map<string, string> = new Map()

  constructor(routes: Route[], root: HTMLElement) {
    this.routes = routes
    this.rootEl = root

    for (const route of routes) {
      if (route.name) this.nameIndex.set(route.name, route.path)
    }
    this.handleNavigationBound = this.handleNavigation.bind(this)
    this.handleLinkClickBound = this.handleLinkClick.bind(this)

    window.addEventListener('popstate', this.handleNavigationBound)
    document.addEventListener('click', this.handleLinkClickBound)

    void this.handleNavigation()
  }

  public navigate(path: string) {
    if (!this.rootEl) {
      throw new Error('Router has been destroyed or not initialized.')
    }
    history.pushState({}, '', path)
    void this.handleNavigation()
  }

  public href(name: string, params?: Record<string, string>): string {
    const pattern = this.nameIndex.get(name)
    if (pattern === undefined) {
      throw new Error(`No route named "${name}".`)
    }
    return pattern
      .split('/')
      .map((segment) => {
        if (!segment.startsWith(':')) return segment
        const key = segment.slice(1)
        const value = params?.[key]
        if (value === undefined) throw new Error(`Missing param "${key}" for route "${name}".`)
        return encodeURIComponent(value)
      })
      .join('/')
  }

  public destroy() {
    if (this.currentPage?.destroy) {
      this.currentPage.destroy()
      this.currentPage = null
    }
    window.removeEventListener('popstate', this.handleNavigationBound)
    document.removeEventListener('click', this.handleLinkClickBound)
    this.rootEl = null
  }

  private handleLinkClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }

    const link = (e.target as HTMLElement).closest('a')
    if (
      !link ||
      link.target ||
      link.hasAttribute('download') ||
      link.getAttribute('rel') === 'external' ||
      !link.href
    ) {
      return
    }

    const url = new URL(link.href)
    if (url.origin !== window.location.origin) return

    e.preventDefault()
    this.navigate(url.pathname + url.search + url.hash)
  }

  private destroyCurrentPage() {
    if (this.currentPage?.destroy) {
      try {
        this.currentPage.destroy()
      } catch {
        // a broken destroy hook must not block the next route from rendering
      }
    }
    this.currentPage = null
  }

  private async handleNavigation() {
    if (!this.rootEl) return
    const navId = ++this.currentNavId
    const url = new URL(window.location.href)

    for (const route of this.routes) {
      const params = this.matchRoute(route.path, url.pathname)
      if (!params) continue

      let page: PageModule
      try {
        page = await route.loader()
      } catch {
        // Loader failure: abandon this navigation and clear stale content.
        if (navId === this.currentNavId && this.rootEl) {
          this.destroyCurrentPage()
          this.rootEl.innerHTML = ''
        }
        return
      }

      if (navId !== this.currentNavId || !this.rootEl) return

      this.destroyCurrentPage()
      this.rootEl.innerHTML = ''
      this.currentPage = page

      page.render({
        path: url.pathname,
        params,
        query: url.searchParams,
        root: this.rootEl,
      })

      return
    }

    // No route matched: clear the root.
    this.destroyCurrentPage()
    this.rootEl.innerHTML = ''
  }

  private matchRoute(routePath: string, urlPath: string): Record<string, string> | null {
    const routeParts = routePath.split('/').filter(Boolean)
    const urlParts = urlPath.split('/').filter(Boolean)

    if (routeParts.length !== urlParts.length) return null

    const params: Record<string, string> = {}

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]
      const urlPart = urlParts[i]

      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = decodeURIComponent(urlPart)
      } else if (routePart !== urlPart) {
        return null
      }
    }

    return params
  }
}
