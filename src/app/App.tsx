import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'
import { SmoothScrollProvider } from '@/lib/smooth-scroll'
import { PreloaderProvider } from '@/components/preloader/preloader-state'

/** Lazy route helper — each page is its own chunk. */
const page = (load: () => Promise<{ default: React.ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
})

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, ...page(() => import('@/pages/Home')) },
      { path: 'about', ...page(() => import('@/pages/About')) },
      { path: 'contact', ...page(() => import('@/pages/Contact')) },
      { path: '*', ...page(() => import('@/pages/NotFound')) },
    ],
  },
]

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <PreloaderProvider>
      <SmoothScrollProvider>
        <RouterProvider router={router} />
      </SmoothScrollProvider>
    </PreloaderProvider>
  )
}
