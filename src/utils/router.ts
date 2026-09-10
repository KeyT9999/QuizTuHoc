import { useState, useEffect, useCallback } from 'react';

export type AppRoute =
  | { type: 'course_list' }
  | { type: 'course_detail'; courseId: string }
  | { type: 'quiz'; courseId: string; setId: string }
  | { type: 'new_quiz'; courseId: string }
  | { type: 'flashcard' };

export function parseRoute(pathname: string): AppRoute {
  // Normalize path: strip trailing slash, replace multiple slashes
  const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const parts = cleanPath.split('/').filter(Boolean);

  // 1. Root / Courses: / or /courses or /course
  if (parts.length === 0 || (parts.length === 1 && (parts[0] === 'courses' || parts[0] === 'course'))) {
    return { type: 'course_list' };
  }

  // 2. Flashcards: /flashcards or /flashcard
  if (parts[0] === 'flashcards' || (parts.length === 2 && parts[0] === 'course' && parts[1] === 'flashcard')) {
    return { type: 'flashcard' };
  }

  // 3. Course-related routes: /course/:courseId... or /courses/:courseId...
  if (parts[0] === 'course' || parts[0] === 'courses') {
    const courseId = parts[1];
    if (!courseId) {
      return { type: 'course_list' };
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
  return { type: 'course_list' };
}

export function buildRouteUrl(route: AppRoute): string {
  switch (route.type) {
    case 'course_list':
      return '/courses';
    case 'course_detail':
      return `/course/${route.courseId}`;
    case 'quiz':
      return `/course/${route.courseId}/${route.setId}`;
    case 'new_quiz':
      return `/course/${route.courseId}/new-quiz`;
    case 'flashcard':
      return '/flashcards';
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
