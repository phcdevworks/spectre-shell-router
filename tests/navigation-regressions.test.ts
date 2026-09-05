import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Router, type Route } from '../src/index'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
let router: Router | undefined

beforeEach(() => {
  history.replaceState({}, '', '/')
})
afterEach(() => {
  router?.destroy()
  router = undefined
})

const home: Route = {
  path: '/',
  loader: async () => ({ render: ({ root }) => { root.textContent = 'Home' } }),
}
const errorPage: Route = {
  path: '/error',
  loader: async () => ({ render: ({ root }) => { root.textContent = 'Error' } }),
}

describe('navigation regressions', () => {
  it.each([undefined, '/error'])('handles malformed encoding with errorRoute %s', async (errorRoute) => {
    const root = document.createElement('div')
    const onError = vi.fn()
    const loader = vi.fn(async () => ({ render: vi.fn() }))
    router = new Router([home, errorPage, { path: '/items/:id', loader }], root, {
      scrollRestoration: false, errorRoute, onError,
    })
    await tick()
    router.navigate('/items/%')
    await tick()
    expect(onError).toHaveBeenCalledExactlyOnceWith(expect.any(URIError), {
      from: '/', to: '/items/%',
    })
    expect(loader).not.toHaveBeenCalled()
    expect(root.textContent).toBe(errorRoute ? 'Error' : '')
    router.navigate('/')
    await tick()
    expect(root.textContent).toBe('Home')
  })

  it.each([undefined, '/error'])('cleans up a missing-outlet parent with errorRoute %s', async (errorRoute) => {
    const root = document.createElement('div')
    const destroy = vi.fn()
    const childLoader = vi.fn(async () => ({ render: vi.fn() }))
    const onError = vi.fn()
    router = new Router([home, errorPage, {
      path: '/parent',
      loader: async () => ({ render: ({ root }) => { root.textContent = 'No outlet' }, destroy }),
      routes: [{ path: 'child', loader: childLoader }],
    }], root, { scrollRestoration: false, errorRoute, onError })
    await tick()
    router.navigate('/parent/child')
    await tick()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(childLoader).not.toHaveBeenCalled()
    expect(root.textContent).toBe(errorRoute ? 'Error' : '')
    router.destroy()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it.each(['history', 'hash'] as const)('restores the full URL after cancellation in %s mode', async (mode) => {
    const initial = mode === 'hash' ? '/shell?outer=1#/items?filter=open' : '/items?filter=open#section'
    history.replaceState({}, '', initial)
    const originalUrl = window.location.href
    const root = document.createElement('div')
    const render = vi.fn()
    router = new Router([{ path: '/items', loader: async () => ({ render }) }], root, {
      mode, scrollRestoration: false,
      beforeNavigate({ to }, next) { if (to !== '/blocked') next() },
    })
    await tick()
    router.navigate('/blocked')
    await tick()
    expect(window.location.href).toBe(originalUrl)
    expect(render).toHaveBeenCalledTimes(1)
  })

  it('reports an unmatched route without an errorRoute and cleans up the page', async () => {
    const root = document.createElement('div')
    const onError = vi.fn()
    const destroy = vi.fn()
    router = new Router([{ path: '/', loader: async () => ({
      render: ({ root }) => { root.textContent = 'Home' }, destroy,
    }) }], root, { scrollRestoration: false, onError })
    await tick()
    router.navigate('/missing')
    await tick()
    expect(onError).toHaveBeenCalledExactlyOnceWith(expect.any(Error), { from: '/', to: '/missing' })
    expect(root.textContent).toBe('')
    expect(destroy).toHaveBeenCalledTimes(1)
  })
})
