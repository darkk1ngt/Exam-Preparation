import { createContext, useContext, useEffect, useState } from 'react';

const NavigationContext = createContext(null);

const PATH_TO_PAGE = {
  '/': 'home',
  '/home': 'home',
  '/login': 'login',
  '/register': 'register',
  '/verify-email': 'verify-email',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/product': 'product',
  '/tracking': 'tracking',
  '/loyalty': 'loyalty',
  '/notifications': 'notifications',
  '/producer': 'producer',
  '/admin': 'admin',
};

const PAGE_TO_PATH = {
  home: '/home',
  login: '/login',
  register: '/register',
  'verify-email': '/verify-email',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  cart: '/cart',
  checkout: '/checkout',
  product: '/product',
  tracking: '/tracking',
  loyalty: '/loyalty',
  notifications: '/notifications',
  producer: '/producer',
  admin: '/admin',
};

function parseLocationToRoute() {
  const path = (window.location.pathname || '/').toLowerCase();
  const page = PATH_TO_PAGE[path] || 'home';
  const search = new URLSearchParams(window.location.search);

  if (page === 'verify-email') {
    return {
      page,
      params: {
        token: search.get('token') || '',
        email: search.get('email') || '',
      },
    };
  }

  if (page === 'reset-password') {
    return { page, params: { token: search.get('token') || '' } };
  }

  if (page === 'home') {
    const category = search.get('category') || '';
    const query = search.get('search') || '';
    return {
      page,
      params: {
        ...(category ? { category } : {}),
        ...(query ? { search: query } : {}),
      },
    };
  }

  if (page === 'product') {
    const productId = search.get('productId') || '';
    return { page, params: productId ? { productId } : {} };
  }

  return { page, params: {} };
}

function buildUrl(page, params = {}) {
  const basePath = PAGE_TO_PATH[page] || '/home';
  const search = new URLSearchParams();

  if (page === 'verify-email' && params.token) {
    search.set('token', params.token);
  }

  if (page === 'verify-email' && params.email) {
    search.set('email', params.email);
  }

  if (page === 'reset-password' && params.token) {
    search.set('token', params.token);
  }

  if (page === 'home') {
    if (params.category) search.set('category', params.category);
    if (params.search) search.set('search', params.search);
  }

  if (page === 'product' && params.productId) {
    search.set('productId', params.productId);
  }

  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getInitialRoute() {
  return parseLocationToRoute();
}

export function NavigationProvider({ children }) {
  const initial = getInitialRoute();
  const [page, setPage] = useState(initial.page);
  const [params, setParams] = useState(initial.params);

  const navigate = (to, newParams = {}, options = {}) => {
    setPage(to);
    setParams(newParams);

    if (!options.silent) {
      const url = buildUrl(to, newParams);
      window.history.pushState({ page: to, params: newParams }, '', url);
    }

    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPopState = () => {
      const route = parseLocationToRoute();
      setPage(route.page);
      setParams(route.params);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <NavigationContext.Provider value={{ page, params, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
