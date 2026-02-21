import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";
import { ping } from "../lib/rpc.ts";

const INTERVAL = 1500;

export function useHealth(url: Accessor<string>): Accessor<boolean> {
  const [connected, setConnected] = createSignal(false);

  createEffect(() => {
    const currentUrl = url();

    const check = () => ping(currentUrl).then(setConnected);
    check();

    const id = setInterval(check, INTERVAL);
    onCleanup(() => clearInterval(id));
  });

  return connected;
}
