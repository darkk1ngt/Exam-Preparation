import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

function getInitialRoute() {
  const search = new URLSearchParams(window.location.search);
  const token = search.get('token');
  if (token) return { page: 'reset-password', params: { token } };
  return { page: 'home', params: {} };
}

export function NavigationProvider({ children }) {
  const initial = getInitialRoute();
  const [page, setPage] = useState(initial.page);
  const [params, setParams] = useState(initial.params);

  const navigate = (to, newParams = {}) => {
    setPage(to);
    setParams(newParams);
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{ page, params, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
