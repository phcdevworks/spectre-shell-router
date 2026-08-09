export type PageModule = {
  render: (ctx: RouteContext) => void
  destroy?: () => void
}

export type RouteContext = {
  path: string
  params: Record<string, string>
  query: URLSearchParams
  root: HTMLElement
  meta?: Record<string, unknown>
}

export type Route = {
  path: string
  name?: string
  meta?: Record<string, unknown>
  loader: () => Promise<PageModule>
  routes?: Route[]
}

export type NavigationContext = {
  from: string | null
  to: string
}

export type RouterOptions = {
  mode?: 'history' | 'hash'
  scrollRestoration?: boolean
  errorRoute?: string
  beforeNavigate?: (
    context: NavigationContext,
    next: (redirect?: string) => void,
  ) => void | Promise<void>
  onNavigationStart?: (context: NavigationContext) => void
  onNavigationEnd?: (context: NavigationContext) => void
  afterNavigate?: (context: RouteContext) => void
  onError?: (error: unknown, context: NavigationContext) => void
}

export type Unsubscribe = () => void

type MatchedLevel = {
  route: Route
  params: Record<string, string>
}

type ChainEntry = MatchedLevel & {
  page: PageModule
  outlet: HTMLElement
}

function paramsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  return aKeys.every((key) => a[key] === b[key])
}

export class Router {
  private routes: Route[]
  private rootEl: HTMLElement | null
  private options: RouterOptions
  private mode: 'history' | 'hash'
  private scrollRestoration: boolean
  private currentChain: ChainEntry[] = []
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

    const allPaths = this.indexRoutes(routes, '')
    if (options.errorRoute !== undefined && !allPaths.includes(options.errorRoute)) {
      throw new Error(`errorRoute "${options.errorRoute}" does not match any route path.`)
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

  public replace(path: string) {
    if (!this.rootEl) {
      throw new Error('Router has been destroyed or not initialized.')
    }
    if (this.scrollRestoration) {
      history.replaceState({ ...history.state, scrollY: window.scrollY }, '')
    }
    history.replaceState({}, '', this.mode === 'hash' ? `#${path}` : path)
    void this.handleNavigation('push')
  }

  public back() {
    history.back()
  }

  public forward() {
    history.forward()
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
    this.destroyChain(0)
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

  private destroyChain(fromIndex: number) {
    for (let i = this.currentChain.length - 1; i >= fromIndex; i--) {
      const entry = this.currentChain[i]
      if (entry.page.destroy) {
        try {
          entry.page.destroy()
        } catch {
          // a broken destroy hook must not block the next route from rendering
        }
      }
    }
    this.currentChain.length = fromIndex
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

    const segments = path.split('/').filter(Boolean)
    const chain = this.matchChain(this.routes, segments)

    if (chain) {
      await this.renderChain(navId, chain, path, query, navContext, source)
      return
    }

    if (this.options.errorRoute !== undefined && path !== this.options.errorRoute) {
      this.options.onError?.(new Error(`No route matches "${path}".`), navContext)
      this.replace(this.options.errorRoute)
      return
    }

    this.destroyChain(0)
    this.rootEl.innerHTML = ''
    this.currentPath = path
  }

  private async renderChain(
    navId: number,
    chain: MatchedLevel[],
    path: string,
    query: URLSearchParams,
    navContext: NavigationContext,
    source: 'push' | 'pop',
  ) {
    if (!this.rootEl) return

    let divergeAt = 0
    while (
      divergeAt < chain.length - 1 &&
      divergeAt < this.currentChain.length &&
      this.currentChain[divergeAt].route === chain[divergeAt].route &&
      paramsEqual(this.currentChain[divergeAt].params, chain[divergeAt].params)
    ) {
      divergeAt++
    }

    this.destroyChain(divergeAt)

    let mountRoot: HTMLElement =
      divergeAt === 0 ? this.rootEl : this.currentChain[divergeAt - 1].outlet
    mountRoot.innerHTML = ''

    let mergedParams: Record<string, string> = {}
    for (let i = 0; i < divergeAt; i++) {
      mergedParams = { ...mergedParams, ...this.currentChain[i].params }
    }

    for (let i = divergeAt; i < chain.length; i++) {
      const { route, params } = chain[i]
      mergedParams = { ...mergedParams, ...params }
      const isLeaf = i === chain.length - 1

      let page: PageModule
      try {
        page = await route.loader()
      } catch (error) {
        if (navId !== this.currentNavId || !this.rootEl) return
        this.options.onError?.(error, navContext)
        if (this.options.errorRoute !== undefined && path !== this.options.errorRoute) {
          this.replace(this.options.errorRoute)
        } else {
          this.destroyChain(0)
          this.rootEl.innerHTML = ''
        }
        return
      }

      if (navId !== this.currentNavId || !this.rootEl) return

      const context: RouteContext = {
        path,
        params: mergedParams,
        query,
        root: mountRoot,
        meta: route.meta,
      }

      page.render(context)

      let outlet = mountRoot
      if (!isLeaf) {
        const found = mountRoot.querySelector<HTMLElement>('[data-router-outlet]')
        if (!found) {
          const error = new Error(
            `Route "${route.path}" has child routes but its rendered output has no ` +
              '[data-router-outlet] element for them to mount into.',
          )
          this.options.onError?.(error, navContext)
          if (this.options.errorRoute !== undefined && path !== this.options.errorRoute) {
            this.replace(this.options.errorRoute)
          } else {
            this.destroyChain(0)
            this.rootEl.innerHTML = ''
          }
          return
        }
        outlet = found
      }

      this.currentChain.push({ route, params, page, outlet })
      mountRoot = outlet

      if (isLeaf) {
        this.currentPath = path
        this.notifySubscribers(context)
        this.options.afterNavigate?.(context)
      }
    }

    if (this.scrollRestoration) {
      if (source === 'pop') {
        const savedY = (history.state as Record<string, unknown>)?.scrollY
        window.scrollTo(0, typeof savedY === 'number' ? savedY : 0)
      } else {
        window.scrollTo(0, 0)
      }
    }
  }

  private indexRoutes(routes: Route[], prefix: string): string[] {
    const paths: string[] = []
    for (const route of routes) {
      const full = this.joinPath(prefix, route.path)
      paths.push(full)
      if (route.name) this.nameIndex.set(route.name, full)
      if (route.routes && route.routes.length > 0) {
        paths.push(...this.indexRoutes(route.routes, full))
      }
    }
    return paths
  }

  private joinPath(prefix: string, path: string): string {
    if (prefix === '') return path
    if (path === '' || path === '/') return prefix
    const left = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
    const right = path.startsWith('/') ? path.slice(1) : path
    return `${left}/${right}`
  }

  private matchSegments(routeParts: string[], urlParts: string[]): Record<string, string> | null {
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

  private matchChain(routes: Route[], segments: string[]): MatchedLevel[] | null {
    for (const route of routes) {
      const routeParts = route.path.split('/').filter(Boolean)
      const children = route.routes

      if (children && children.length > 0) {
        if (segments.length < routeParts.length) continue
        const params = this.matchSegments(routeParts, segments.slice(0, routeParts.length))
        if (!params) continue
        const childChain = this.matchChain(children, segments.slice(routeParts.length))
        if (!childChain) continue
        return [{ route, params }, ...childChain]
      }

      const params = this.matchSegments(routeParts, segments)
      if (!params) continue
      return [{ route, params }]
    }
    return null
  }
}
