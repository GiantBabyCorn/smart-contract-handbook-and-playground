/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppShell from './components/layout/AppShell';
import SkeletonBlock from './components/common/SkeletonBlock';

const HomePage = lazy(() => import('./pages/HomePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<SkeletonBlock type="home" />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/playground',
        element: (
          <Suspense fallback={<SkeletonBlock type="home" />}>
            <PlaygroundPage />
          </Suspense>
        ),
      },
      {
        path: '/catalog',
        element: (
          <Suspense fallback={<SkeletonBlock type="home" />}>
            <CatalogPage />
          </Suspense>
        ),
      },
      {
        path: '/:slug',
        element: (
          <Suspense fallback={<SkeletonBlock type="detail" />}>
            <DetailPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={null}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
