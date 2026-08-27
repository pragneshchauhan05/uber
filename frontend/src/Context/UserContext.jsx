import { createContext, useState, useEffect } from "react";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : {
        email: "",
        fullName: {
          firstName: "",
          lastName: "",
        },
      };
    } catch {
      return {
        email: "",
        fullName: {
          firstName: "",
          lastName: "",
        },
      };
    }
  });

  useEffect(() => {
    if (user && (user._id || user.email)) {
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        console.error("Error saving user to localStorage", err);
      }
    }
  }, [user]);

  return (
    <UserDataContext.Provider value={[user, setUser]}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
