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

export type NavigationContext = {
  from: string | null
  to: string
}

export type RouterOptions = {
  mode?: 'history' | 'hash'
  scrollRestoration?: boolean
  beforeNavigate?: (
    context: NavigationContext,
    next: (redirect?: string) => void,
  ) => void | Promise<void>
  onNavigationStart?: (context: NavigationContext) => void
  onNavigationEnd?: (context: NavigationContext) => void
}

export type Unsubscribe = () => void

export class Router {
  private routes: Route[]
  private rootEl: HTMLElement | null
  private options: RouterOptions
  private mode: 'history' | 'hash'
  private scrollRestoration: boolean
  private currentPage: PageModule | null = null
  private handleNavigationBound: () => void
  private handleHashChangeBound: () => void
  private handleLinkClickBound: (e: MouseEvent) => void
  private currentNavId = 0
  private currentPath: string | null = null
  private nameIndex: Map<string, string> = new Map()
  private subscribers: Set<(context: RouteContext) => void> = new Set()

  constructor(routes: Route[], root: HTMLElement, options: RouterOptions = {}) {
    this.routes = routes
    this.rootEl = root
    this.options = options
    this.mode = options.mode ?? 'history'
    this.scrollRestoration = options.scrollRestoration !== false

    for (const route of routes) {
      if (route.name) this.nameIndex.set(route.name, route.path)
    }
    this.handleNavigationBound = () => { void this.handleNavigation('pop') }
    this.handleHashChangeBound = this.handleHashChange.bind(this)
    this.handleLinkClickBound = this.handleLinkClick.bind(this)

    window.addEventListener('popstate', this.handleNavigationBound)
    if (this.mode === 'hash') {
      window.addEventListener('hashchange', this.handleHashChangeBound)
    }
    document.addEventListener('click', this.handleLinkClickBound)

    void this.handleNavigation('push')
  }

  public navigate(path: string) {
    if (!this.rootEl) {
      throw new Error('Router has been destroyed or not initialized.')
    }
    if (this.scrollRestoration) {
      history.replaceState({ ...history.state, scrollY: window.scrollY }, '')
    }
    history.pushState({}, '', this.mode === 'hash' ? `#${path}` : path)
    void this.handleNavigation('push')
  }

  public subscribe(callback: (context: RouteContext) => void): Unsubscribe {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public href(name: string, params?: Record<string, string>): string {
    const pattern = this.nameIndex.get(name)
    if (pattern === undefined) {
      throw new Error(`No route named "${name}".`)
    }
    const path = pattern
      .split('/')
      .map((segment) => {
        if (!segment.startsWith(':')) return segment
        const key = segment.slice(1)
        const value = params?.[key]
        if (value === undefined) throw new Error(`Missing param "${key}" for route "${name}".`)
        return encodeURIComponent(value)
      })
      .join('/')
    return this.mode === 'hash' ? `#${path}` : path
  }

  public destroy() {
    this.destroyCurrentPage()
    window.removeEventListener('popstate', this.handleNavigationBound)
    if (this.mode === 'hash') {
      window.removeEventListener('hashchange', this.handleHashChangeBound)
    }
    document.removeEventListener('click', this.handleLinkClickBound)
    this.rootEl = null
  }

  private getCurrentPath(): string {
    if (this.mode === 'hash') {
      const hash = window.location.hash
      return (hash.startsWith('#/') ? hash.slice(1) : '/').split('?')[0] || '/'
    }
    return window.location.pathname
  }

  private getCurrentQuery(): URLSearchParams {
    if (this.mode === 'hash') {
      const hash = window.location.hash.slice(1)
      const qIndex = hash.indexOf('?')
      return new URLSearchParams(qIndex >= 0 ? hash.slice(qIndex + 1) : '')
    }
    return new URL(window.location.href).searchParams
  }

  private handleHashChange() {
    if (window.location.hash.startsWith('#/')) {
      void this.handleNavigation('pop')
    }
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

    if (this.mode === 'hash') {
      if (!url.hash.startsWith('#/')) return
      e.preventDefault()
      this.navigate(url.hash.slice(1))
      return
    }

    e.preventDefault()
    this.navigate(url.pathname + url.search + url.hash)
  }

  private notifySubscribers(context: RouteContext) {
    for (const subscriber of this.subscribers) {
      subscriber(context)
    }
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

  private async handleNavigation(source: 'push' | 'pop') {
    if (!this.rootEl) return
    const navId = ++this.currentNavId
    const path = this.getCurrentPath()
    const query = this.getCurrentQuery()
    const navContext: NavigationContext = { from: this.currentPath, to: path }

    this.options.onNavigationStart?.(navContext)
    try {
      await this.runNavigation(navId, source, path, query, navContext)
    } finally {
      this.options.onNavigationEnd?.(navContext)
    }
  }

  private async runNavigation(
    navId: number,
    source: 'push' | 'pop',
    path: string,
    query: URLSearchParams,
    navContext: NavigationContext,
  ) {
    if (!this.rootEl) return

    if (this.options.beforeNavigate) {
      let allowed = false
      let redirectTo: string | undefined

      await this.options.beforeNavigate(navContext, (redirect?: string) => {
        allowed = true
        redirectTo = redirect
      })

      if (navId !== this.currentNavId || !this.rootEl) return

      if (!allowed) {
        if (this.currentPath !== null) {
          history.replaceState({}, '', this.mode === 'hash' ? `#${this.currentPath}` : this.currentPath)
        }
        return
      }

      if (redirectTo !== undefined) {
        this.navigate(redirectTo)
        return
      }
    }

    for (const route of this.routes) {
      const params = this.matchRoute(route.path, path)
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
      this.currentPath = path

      const context: RouteContext = {
        path,
        params,
        query,
        root: this.rootEl,
      }

      page.render(context)
      this.notifySubscribers(context)

      if (this.scrollRestoration) {
        if (source === 'pop') {
          const savedY = (history.state as Record<string, unknown>)?.scrollY
          window.scrollTo(0, typeof savedY === 'number' ? savedY : 0)
        } else {
          window.scrollTo(0, 0)
        }
      }

      return
    }

    this.destroyCurrentPage()
    this.rootEl.innerHTML = ''
    this.currentPath = path
  }

  private matchRoute(routePath: string, urlPath: string): Record<string, string> | null {
    const routeParts = routePath.split('/').filter(Boolean)
    const urlParts = urlPath.split('/').filter(Boolean)

    if (routeParts.length !== urlParts.length) return null

    const params: Record<string, string> = {}

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]
      const urlPart = decodeURIComponent(urlParts[i])

      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = urlPart
      } else if (routePart !== urlPart) {
        return null
      }
    }

    return params
  }
}
