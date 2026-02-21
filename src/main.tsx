import { render } from "solid-js/web";
import { AppProvider } from "./context/app.tsx";
import { App } from "./App.tsx";
import "./styles/global.css";

render(
  () => (
    <AppProvider>
      <App />
    </AppProvider>
  ),
  document.getElementById("root")!,
);
