import { createSignal, Match, Switch } from "solid-js";
import type { ContractInfo } from "../../types.ts";
import { ReadTab } from "./ReadTab.tsx";
import { WriteTab } from "./WriteTab.tsx";
import styles from "./ContractDetail.module.css";

type Props = { contract: ContractInfo };
type Tab = "read" | "write";

export function ContractDetail(props: Props) {
  const [tab, setTab] = createSignal<Tab>("read");

  return (
    <div class={styles.wrapper}>
      <div class={styles.panel}>
        <div class={styles.tabs}>
          <button
            class={styles.tab}
            classList={{ [styles.tabActive]: tab() === "read" }}
            onClick={() => setTab("read")}
          >
            read
          </button>
          <button
            class={styles.tab}
            classList={{ [styles.tabActive]: tab() === "write" }}
            onClick={() => setTab("write")}
          >
            write
          </button>
        </div>
        <Switch>
          <Match when={tab() === "read"}>
            <ReadTab contract={props.contract} />
          </Match>
          <Match when={tab() === "write"}>
            <WriteTab contract={props.contract} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
