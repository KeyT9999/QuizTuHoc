import { useState, useEffect, useCallback } from 'react';

export type HomeNavTab = 'home' | 'library' | 'stats';

export type AppRoute =
  | { type: 'course_list'; tab: HomeNavTab }
  | { type: 'course_detail'; courseId: string }
  | { type: 'quiz'; courseId: string; setId: string }
  | { type: 'new_quiz'; courseId: string }
  | { type: 'flashcard' }
  | { type: 'profile' }
  | { type: 'auth_callback' };

export function parseRoute(pathname: string): AppRoute {
  // Normalize path: strip trailing slash, replace multiple slashes
  const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const parts = cleanPath.split('/').filter(Boolean);

  // 1. Root / Home / Library / Stats
  if (parts.length === 0) {
    return { type: 'course_list', tab: 'library' };
  }
  if (parts.length === 1) {
    if (parts[0] === 'home') {
      return { type: 'course_list', tab: 'home' };
    }
    if (parts[0] === 'stats' || parts[0] === 'statistics') {
      return { type: 'course_list', tab: 'stats' };
    }
    if (parts[0] === 'courses' || parts[0] === 'course' || parts[0] === 'library') {
      return { type: 'course_list', tab: 'library' };
    }
    if (parts[0] === 'profile') {
      return { type: 'profile' };
    }
  }

  // 1b. Google OAuth callback route: /auth/callback
  if (parts.length === 2 && parts[0] === 'auth' && parts[1] === 'callback') {
    return { type: 'auth_callback' };
  }

  // 2. Flashcards: /flashcards or /flashcard
  if (parts[0] === 'flashcards' || (parts.length === 2 && parts[0] === 'course' && parts[1] === 'flashcard')) {
    return { type: 'flashcard' };
  }

  // 3. Course-related routes: /course/:courseId... or /courses/:courseId...
  if (parts[0] === 'course' || parts[0] === 'courses') {
    const courseId = parts[1];
    if (!courseId) {
      return { type: 'course_list', tab: 'library' };
    }

    if (parts.length === 2) {
      return { type: 'course_detail', courseId };
    }

    if (parts.length >= 3) {
      const subAction = parts[2];
      if (subAction === 'new-quiz' || subAction === 'create-quiz') {
        return { type: 'new_quiz', courseId };
      }
      // Quiz route: /course/:courseId/:setId or /course/:courseId/quiz/:setId
      if (subAction === 'quiz' && parts[3]) {
        return { type: 'quiz', courseId, setId: parts[3] };
      }
      return { type: 'quiz', courseId, setId: subAction };
    }
  }

  // Default fallback to course list
  return { type: 'course_list', tab: 'library' };
}

export function buildRouteUrl(route: AppRoute): string {
  switch (route.type) {
    case 'course_list':
      if (route.tab === 'home') return '/home';
      if (route.tab === 'stats') return '/stats';
      return '/courses';
    case 'course_detail':
      return `/course/${route.courseId}`;
    case 'quiz':
      return `/course/${route.courseId}/${route.setId}`;
    case 'new_quiz':
      return `/course/${route.courseId}/new-quiz`;
    case 'flashcard':
      return '/flashcards';
    case 'profile':
      return '/profile';
    case 'auth_callback':
      return '/auth/callback';
  }
}

// Custom event to coordinate programmatic navigation across components
const ROUTE_CHANGE_EVENT = 'app_route_change';

export function navigateTo(pathOrRoute: string | AppRoute, replace = false): void {
  const url = typeof pathOrRoute === 'string' ? pathOrRoute : buildRouteUrl(pathOrRoute);
  if (window.location.pathname === url) {
    return;
  }

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
}

export function useAppRouter() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener(ROUTE_CHANGE_EVENT, handleLocationChange);
    };
  }, []);

  const navigate = useCallback((pathOrRoute: string | AppRoute, replace = false) => {
    navigateTo(pathOrRoute, replace);
  }, []);

  return { route, navigate };
}
