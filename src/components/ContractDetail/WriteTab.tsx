import { For } from "solid-js";
import type { ContractInfo } from "../../types.ts";
import { getFunctions } from "../../lib/abi.ts";
import { FunctionItem } from "./FunctionItem.tsx";
import styles from "./ContractDetail.module.css";

type Props = { contract: ContractInfo };

export function WriteTab(props: Props) {
  const fns = () =>
    getFunctions(props.contract.abi).filter(
      (f) => f.state_mutability === "external",
    );

  return (
    <div class={styles.list}>
      <For each={fns()}>
        {(fn) => <FunctionItem fn={fn} contract={props.contract} />}
      </For>
    </div>
  );
}
