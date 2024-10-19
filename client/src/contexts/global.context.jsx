import { createContext } from "react";

export const GlobalContext = createContext({
  //data goes here
});

export const GlobalProvider = ({ children }) => {
  //the functional data goes here

  const value = {
    //exported values go in here
  };
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
