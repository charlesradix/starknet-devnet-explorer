import { For, Show } from "solid-js";
import type { ContractInfo } from "../../types.ts";
import { shortAddress } from "../../lib/format.ts";
import styles from "./ContractList.module.css";

type Props = {
  contracts: ContractInfo[];
  selected?: string;
  onSelect: (address: string) => void;
};

export function ContractList(props: Props) {
  return (
    <aside class={styles.panel}>
      <div class={styles.title}>contracts</div>
      <div class={styles.list}>
        <Show
          when={props.contracts.length > 0}
          fallback={<p class={styles.fallback}>no contracts deployed</p>}
        >
          <For each={props.contracts}>
            {(c) => (
              <div
                class={styles.item}
                classList={{ [styles.active]: c.address === props.selected }}
                onClick={() => props.onSelect(c.address)}
              >
                <span class={styles.name}>{c.name}</span>
                <span class={styles.address}>{shortAddress(c.address)}</span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
}
