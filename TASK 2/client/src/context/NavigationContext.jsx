import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});

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
