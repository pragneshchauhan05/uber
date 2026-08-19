import React, { createContext, useEffect } from "react";
import { io } from "socket.io-client";

import { getApiBaseUrl } from "../config";

export const SocketContext = createContext();

const socket = io(getApiBaseUrl());


const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.on("connect", () => {});

    socket.on("disconnect", () => {});
  }, []);

  const sendMessage = (eventName, message) => {
    socket.emit(eventName, message);
  };

  const receiveMessage = (eventName, callback) => {
    socket.on(eventName, callback);
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage, receiveMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
