import { createSignal, onCleanup, For, Show } from "solid-js";
import { useApp } from "../../context/app.tsx";
import { getFunctionBySelector } from "../../lib/abi.ts";
import { shortAddress, relativeTime } from "../../lib/format.ts";
import styles from "./TxPanel.module.css";

function CopyIcon() {
  return (
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
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function TxPanel() {
  const { txs, contracts } = useApp();
  const [open, setOpen] = createSignal(false);
  const [now, setNow] = createSignal(Date.now());
  const tick = setInterval(() => setNow(Date.now()), 5000);
  onCleanup(() => clearInterval(tick));
  const hasTxs = () => txs().length > 0;

  return (
    <div class={styles.panel} classList={{ [styles.panelOpen]: open() }}>
      <button
        class={styles.toggle}
        onClick={() => hasTxs() && setOpen((o) => !o)}
        classList={{ [styles.toggleDisabled]: !hasTxs() }}
      >
        <span>transactions ({txs().length})</span>
        <Show when={hasTxs()}>
          <span class={styles.chevron}>{open() ? "▲" : "▼"}</span>
        </Show>
      </button>
      <Show when={open()}>
        <div class={styles.body}>
          <Show
            when={txs().length > 0}
            fallback={<p class={styles.empty}>no transactions yet</p>}
          >
            <table class={styles.table}>
              <thead>
                <tr class={styles.tableHeader}>
                  <th>HASH</th>
                  <th>TYPE</th>
                  <th>CONTRACT</th>
                  <th>FUNCTION</th>
                  <th>BLOCK</th>
                  <th>AGE</th>
                </tr>
              </thead>
              <tbody>
                <For each={txs()}>
                  {(tx) => {
                    const contract = () =>
                      tx.callTarget
                        ? contracts().find(
                            (c) => BigInt(c.address) === BigInt(tx.callTarget!),
                          )
                        : undefined;
                    const fnName = () =>
                      contract() && tx.functionSelector
                        ? getFunctionBySelector(
                            contract()!.abi,
                            tx.functionSelector,
                          )
                        : undefined;

                    return (
                      <tr>
                        <td>
                          {shortAddress(tx.hash)}
                          <button
                            type="button"
                            class={styles.copyBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(tx.hash);
                            }}
                          >
                            <CopyIcon />
                          </button>
                        </td>
                        <td>
                          <span class={styles.badge}>{tx.type}</span>
                        </td>
                        <td class={styles.dim}>
                          {contract()?.name ??
                            (tx.callTarget ? shortAddress(tx.callTarget) : "—")}
                        </td>
                        <td class={styles.dim}>{fnName() ?? "—"}</td>
                        <td>{tx.blockNumber}</td>
                        <td class={styles.dim}>
                          {relativeTime(tx.timestamp, now())}
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      </Show>
    </div>
  );
}
