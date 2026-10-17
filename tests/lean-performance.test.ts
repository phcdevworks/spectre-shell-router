import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { Router, type NavigationContext, type Route, type RouteParams } from '../src/index'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
let router: Router | undefined

beforeEach(() => {
  history.replaceState({}, '', '/')
  document.body.innerHTML = ''
})
afterEach(() => {
  router?.destroy()
  router = undefined
})

const page =
  (text: string): Route['loader'] =>
  async () => ({
    render: ({ root }) => {
      root.textContent = text
    },
  })

describe('guard-aware navigation context', () => {
  it('exposes params, query, and chain-merged meta to beforeNavigate', async () => {
    const seen: NavigationContext[] = []
    const routes: Route[] = [
      { path: '/', loader: page('Home') },
      {
        path: '/app',
        meta: { requiresAuth: true, title: 'App' },
        loader: async () => ({
          render: ({ root }) => {
            root.innerHTML = '<main data-router-outlet></main>'
          },
        }),
        routes: [{ path: 'users/:id', meta: { title: 'User' }, loader: page('User') }],
      },
    ]
    router = new Router(routes, document.createElement('div'), {
      scrollRestoration: false,
      beforeNavigate(context, next) {
        seen.push(context)
        next()
      },
    })
    await tick()
    router.navigate('/app/users/7?tab=posts')
    await tick()

    const ctx = seen.at(-1)
    expect(ctx?.params).toEqual({ id: '7' })
    expect(ctx?.query.get('tab')).toBe('posts')
    expect(ctx?.meta).toEqual({ requiresAuth: true, title: 'User' })
  })

  it('lets a guard redirect based on route meta', async () => {
    const root = document.createElement('div')
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/login', loader: page('Login') },
        { path: '/admin', meta: { requiresAuth: true }, loader: page('Admin') },
      ],
      root,
      {
        scrollRestoration: false,
        beforeNavigate({ meta }, next) {
          next(meta?.requiresAuth ? '/login' : undefined)
        },
      }
    )
    await tick()
    router.navigate('/admin')
    await tick()
    expect(root.textContent).toBe('Login')
    expect(window.location.pathname).toBe('/login')
  })

  it('reports empty params and no meta for unmatched paths', async () => {
    const onError = vi.fn()
    router = new Router([{ path: '/', loader: page('Home') }], document.createElement('div'), {
      scrollRestoration: false,
      onError,
    })
    await tick()
    router.navigate('/missing')
    await tick()
    const ctx = onError.mock.calls[0][1] as NavigationContext
    expect(ctx.params).toEqual({})
    expect(ctx.meta).toBeUndefined()
  })
})

describe('shadow DOM link interception', () => {
  it('intercepts anchors rendered inside a shadow root', async () => {
    const root = document.createElement('div')
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/about', loader: page('About') },
      ],
      root,
      { scrollRestoration: false }
    )
    await tick()

    const host = document.createElement('spectre-nav')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const link = document.createElement('a')
    link.href = '/about'
    shadow.appendChild(link)

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 0,
    })
    link.dispatchEvent(event)
    await tick()

    expect(event.defaultPrevented).toBe(true)
    expect(root.textContent).toBe('About')
  })
})

describe('redirect loop cap', () => {
  it('stops a self-redirecting guard, reports it, and reverts the URL', async () => {
    const onError = vi.fn()
    const loopRender = vi.fn()
    const root = document.createElement('div')
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/loop', loader: async () => ({ render: loopRender }) },
      ],
      root,
      {
        scrollRestoration: false,
        onError,
        beforeNavigate({ to }, next) {
          next(to === '/loop' ? '/loop' : undefined)
        },
      }
    )
    await tick()
    router.navigate('/loop')
    await tick()

    expect(onError).toHaveBeenCalledOnce()
    expect(String(onError.mock.calls[0][0])).toMatch(/Redirect limit of 10 exceeded/)
    expect(loopRender).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe('/')
    expect(root.textContent).toBe('Home')
  })

  it('resets the counter so later redirects still work', async () => {
    const root = document.createElement('div')
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/loop', loader: page('Loop') },
        { path: '/old', loader: page('Old') },
        { path: '/new', loader: page('New') },
      ],
      root,
      {
        scrollRestoration: false,
        beforeNavigate({ to }, next) {
          if (to === '/loop') next('/loop')
          else if (to === '/old') next('/new')
          else next()
        },
      }
    )
    await tick()
    router.navigate('/loop')
    await tick()
    router.navigate('/old')
    await tick()
    expect(root.textContent).toBe('New')
  })
})

describe('catch-all segments', () => {
  it('captures the remaining decoded path into params["*"]', async () => {
    const render = vi.fn()
    router = new Router(
      [{ path: '/docs/*', loader: async () => ({ render }) }],
      document.createElement('div'),
      { scrollRestoration: false }
    )
    await tick()
    router.navigate('/docs/guides/getting%20started')
    await tick()
    expect(render.mock.calls.at(-1)?.[0].params['*']).toBe('guides/getting started')

    router.navigate('/docs')
    await tick()
    expect(render.mock.calls.at(-1)?.[0].params['*']).toBe('')
  })

  it('serves an in-place 404 without changing the URL', async () => {
    const root = document.createElement('div')
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '*', loader: page('Not found') },
      ],
      root,
      { scrollRestoration: false }
    )
    await tick()
    router.navigate('/nope/deep')
    await tick()
    expect(root.textContent).toBe('Not found')
    expect(window.location.pathname).toBe('/nope/deep')
  })

  it('works as a nested child and keeps earlier routes first', async () => {
    const root = document.createElement('div')
    router = new Router(
      [
        {
          path: '/app',
          loader: async () => ({
            render: ({ root }) => {
              root.innerHTML = '<main data-router-outlet></main>'
            },
          }),
          routes: [
            { path: 'settings', loader: page('Settings') },
            { path: '*', loader: page('App 404') },
          ],
        },
      ],
      root,
      { scrollRestoration: false }
    )
    await tick()
    router.navigate('/app/settings')
    await tick()
    expect(root.textContent).toBe('Settings')
    router.navigate('/app/unknown')
    await tick()
    expect(root.textContent).toBe('App 404')
  })

  it('builds hrefs for wildcard routes', () => {
    router = new Router(
      [{ name: 'docs', path: '/docs/*', loader: page('Docs') }],
      document.createElement('div')
    )
    expect(router.href('docs', { '*': 'a b/c' })).toBe('/docs/a%20b/c')
    expect(router.href('docs', { '*': '' })).toBe('/docs')
    expect(() => router?.href('docs')).toThrow('Missing param "*"')
  })

  it('rejects "*" outside the final segment or on a route with children', () => {
    const root = document.createElement('div')
    expect(() => new Router([{ path: '/a/*/b', loader: page('x') }], root)).toThrow(
      'only allowed as the final segment'
    )
    expect(
      () =>
        new Router(
          [{ path: '/a/*', loader: page('x'), routes: [{ path: 'b', loader: page('y') }] }],
          root
        )
    ).toThrow('only allowed as the final segment')
  })
})

describe('fragment scrolling', () => {
  const original = Element.prototype.scrollIntoView
  afterEach(() => {
    Element.prototype.scrollIntoView = original
  })

  it('scrolls the fragment target into view on push navigation', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const root = document.createElement('div')
    document.body.appendChild(root)
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        {
          path: '/guide',
          loader: async () => ({
            render: ({ root }) => {
              root.innerHTML = '<h2 id="install">Install</h2>'
            },
          }),
        },
      ],
      root
    )
    await tick()
    vi.mocked(window.scrollTo).mockClear()
    router.navigate('/guide#install')
    await tick()
    expect(scrollIntoView).toHaveBeenCalledOnce()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('falls back to the top when the fragment has no target', async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const root = document.createElement('div')
    document.body.appendChild(root)
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/guide', loader: page('Guide') },
      ],
      root
    )
    await tick()
    vi.mocked(window.scrollTo).mockClear()
    router.navigate('/guide#missing')
    await tick()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })
})

describe('router.current', () => {
  it('tracks the latest rendered context and clears on 404 and destroy', async () => {
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/users/:id', loader: page('User') },
      ],
      document.createElement('div'),
      { scrollRestoration: false }
    )
    expect(router.current).toBeNull()
    await tick()
    expect(router.current?.path).toBe('/')

    router.navigate('/users/3')
    await tick()
    expect(router.current?.params).toEqual({ id: '3' })

    router.navigate('/missing')
    await tick()
    expect(router.current).toBeNull()

    router.navigate('/')
    await tick()
    router.destroy()
    expect(router.current).toBeNull()
    router = undefined
  })
})

describe('RouteParams', () => {
  it('infers param keys from a path string', () => {
    expectTypeOf<RouteParams<'/users/:id/posts/:postId'>>().toEqualTypeOf<{
      id: string
      postId: string
    }>()
    expectTypeOf<RouteParams<'/docs/*'>>().toEqualTypeOf<{ '*': string }>()
    expectTypeOf<RouteParams<'/about'>>().toEqualTypeOf<Record<never, string>>()
  })
})

describe('router.preload', () => {
  it('runs every loader in the matched chain without rendering', async () => {
    const parentRender = vi.fn()
    const childRender = vi.fn()
    const parentLoader = vi.fn(async () => ({ render: parentRender }))
    const childLoader = vi.fn(async () => ({ render: childRender }))
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/app', loader: parentLoader, routes: [{ path: 'reports', loader: childLoader }] },
      ],
      document.createElement('div'),
      { scrollRestoration: false }
    )
    await tick()
    await router.preload('/app/reports?range=7d#top')
    expect(parentLoader).toHaveBeenCalledWith(expect.any(AbortSignal))
    expect(childLoader).toHaveBeenCalledOnce()
    expect(parentRender).not.toHaveBeenCalled()
    expect(childRender).not.toHaveBeenCalled()
  })

  it('is a silent no-op for unmatched paths and failing loaders', async () => {
    const onError = vi.fn()
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        {
          path: '/broken',
          loader: async () => {
            throw new Error('boom')
          },
        },
      ],
      document.createElement('div'),
      { scrollRestoration: false, onError }
    )
    await tick()
    await expect(router.preload('/missing')).resolves.toBeUndefined()
    await expect(router.preload('/broken')).resolves.toBeUndefined()
    await expect(router.preload('/bad/%')).resolves.toBeUndefined()
    expect(onError).not.toHaveBeenCalled()
  })

  it('aborts in-flight preloads on destroy and refuses afterwards', async () => {
    let captured: AbortSignal | undefined
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        {
          path: '/slow',
          loader: (signal) => {
            captured = signal
            return new Promise(() => {})
          },
        },
      ],
      document.createElement('div'),
      { scrollRestoration: false }
    )
    await tick()
    void router.preload('/slow')
    router.destroy()
    expect(captured?.aborted).toBe(true)
    await expect(router.preload('/')).rejects.toThrow('destroyed')
    router = undefined
  })
})

describe('history helpers', () => {
  it('back() and forward() throw after destroy', () => {
    const local = new Router([{ path: '/', loader: page('Home') }], document.createElement('div'))
    local.destroy()
    expect(() => local.back()).toThrow('destroyed')
    expect(() => local.forward()).toThrow('destroyed')
  })

  it('navigate() and replace() attach caller state to the history entry', async () => {
    router = new Router(
      [
        { path: '/', loader: page('Home') },
        { path: '/a', loader: page('A') },
        { path: '/b', loader: page('B') },
      ],
      document.createElement('div'),
      { scrollRestoration: false }
    )
    await tick()
    router.navigate('/a', { state: { from: 'menu' } })
    expect(history.state).toEqual({ from: 'menu' })
    router.replace('/b', { state: { modal: true } })
    expect(history.state).toEqual({ modal: true })
  })
})
