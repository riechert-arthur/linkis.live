
import { render, screen, waitFor } from '@testing-library/react'
import { vi, beforeEach, afterEach, describe, it, expect, type MockedFunction } from 'vitest'

vi.mock('~/components/wrappers/globe-init', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-globe" />,
}))

vi.mock('~/lib/url', () => ({
  __esModule: true,
  getURLMapping: vi.fn(),
}))

import SlugRedirect, { meta } from '~/routes/$slug'
import { getURLMapping } from '~/lib/url'

const getURLMappingMock = getURLMapping as MockedFunction<typeof getURLMapping>

const locDesc = Object.getOwnPropertyDescriptor(window, 'location')!
let originalRAF: typeof window.requestAnimationFrame

beforeEach(() => {
  getURLMappingMock.mockReset()

  delete (window as any).location
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      ...locDesc.value,
      replace: vi.fn(),
    },
  })

  originalRAF = window.requestAnimationFrame
  window.requestAnimationFrame = (cb) => {
    const fakeNow = performance.now() + 5000 // MAX_COUNTDOWN * 1000
    cb(fakeNow)
    return 0
  }
})

afterEach(() => {
  Object.defineProperty(window, 'location', locDesc)
  window.requestAnimationFrame = originalRAF
})

describe('$slug', () => {
  it('meta() returns the correct title and description', () => {
    expect(meta({} as any)).toEqual([
      { title: 'Your Link is Live' },
      { name: 'description', content: 'Redirect is in progress!' },
    ])
  })

  it('renders UI shell and mock globe without crashing', () => {
    getURLMappingMock.mockResolvedValue({ long: 'https://dummy.test' })

    render(<SlugRedirect params={{ slug: 'test-slug' }} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Your connecting link/i)
    expect(screen.getByText(/Please hold on tight/)).toBeInTheDocument()
    expect(screen.getByTestId('mock-globe')).toBeInTheDocument()
  })

  it('handles fetch failure gracefully without redirect', async () => {
    getURLMappingMock.mockRejectedValueOnce(new Error('fetch error'))

    render(<SlugRedirect params={{ slug: 'bad-slug' }} />)

    await waitFor(() => expect(getURLMappingMock).toHaveBeenCalledWith('bad-slug'))
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('fetches then immediately redirects', async () => {
    getURLMappingMock.mockResolvedValue({ long: 'https://dest.test' })

    render(<SlugRedirect params={{ slug: 'foo' }} />)

    expect(getURLMappingMock).toHaveBeenCalledWith('foo')
    expect(screen.getByText(/0\s*%/)).toBeInTheDocument()
    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledWith('https://dest.test')
    })
  })
})

