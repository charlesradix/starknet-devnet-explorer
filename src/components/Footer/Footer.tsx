import { Show } from "solid-js";
import { useApp } from "../../context/app.tsx";
import { shortAddress } from "../../lib/format.ts";
import styles from "./Footer.module.css";

export function Footer() {
  const { url, selected, connected } = useApp();

  return (
    <footer class={styles.footer}>
      <div class={styles.connection}>
        <span class={styles.meta}>{url()}</span>
        <Show when={selected()}>
          <span class={styles.sep}>|</span>
          <span class={styles.meta}>{shortAddress(selected()!.address)}</span>
        </Show>
      </div>
      <div class={styles.network}>
        <span
          class={styles.dot}
          classList={{
            [styles.online]: connected(),
            [styles.offline]: !connected(),
          }}
        />
        <span class={styles.label}>devnet</span>
      </div>
    </footer>
  );
}
