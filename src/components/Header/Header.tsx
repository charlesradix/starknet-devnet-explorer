import { For, Show } from "solid-js";
import { useApp } from "../../context/app.tsx";
import { formatToken } from "../../lib/format.ts";
import styles from "./Header.module.css";

export function Header() {
  const { accounts, selected, setSelected } = useApp();

  return (
    <header class={styles.header}>
      <div class={styles.wrapper}>
        <button class={styles.trigger}>accounts</button>
        <div class={styles.dropdown}>
          <div class={styles.panel}>
            <Show
              when={accounts().length > 0}
              fallback={<p class={styles.fallback}>no accounts available</p>}
            >
              <For each={accounts()}>
                {(account) => (
                  <div
                    class={styles.item}
                    classList={{
                      [styles.active]: account.address === selected()?.address,
                    }}
                    onClick={() => setSelected(account)}
                  >
                    <div class={styles.indicator} />
                    <div class={styles.body}>
                      <div class={styles.addressRow}>
                        <span class={styles.address}>{account.address}</span>
                        <div
                          class={styles.copy}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(account.address);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                          >
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </div>
                      </div>
                      <span class={styles.balance}>
                        {formatToken(account.initial_balance, "strk")}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
