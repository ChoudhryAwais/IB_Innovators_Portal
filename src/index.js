import React from "react";
import App from "./App";
import ReactDOM from "react-dom";
import "./index.css";
import { ContextProvider } from "./Context/MyContext";

ReactDOM.render(
    <ContextProvider>
      <App />
    </ContextProvider>,
  document.getElementById("root")
);
