import { createSignal, For, Match, Show, Switch } from "solid-js";
import type { AbiFunction, ContractInfo } from "../../types.ts";
import { useApp } from "../../context/app.tsx";
import { shortType } from "../../lib/format.ts";
import styles from "./ContractDetail.module.css";

type CallStatus =
  | { type: "result"; values: string[] }
  | { type: "tx"; hash: string }
  | { type: "error"; message: string };

type Props = {
  fn: AbiFunction;
  contract: ContractInfo;
};

export function FunctionItem(props: Props) {
  const { read, write } = useApp();

  const isView = () => props.fn.state_mutability === "view";
  const outputLabel = props.fn.outputs.map((o) => shortType(o.type)).join(", ");

  const [inputs, setInputs] = createSignal<Record<string, string>>(
    Object.fromEntries(props.fn.inputs.map((i) => [i.name, ""])),
  );
  const [status, setStatus] = createSignal<CallStatus | null>(null);
  const [loading, setLoading] = createSignal(false);

  const execute = async () => {
    setLoading(true);
    setStatus(null);
    try {
      if (isView()) {
        const values = await read(
          props.contract.abi,
          props.contract.address,
          props.fn.name,
          inputs(),
        );
        setStatus({ type: "result", values });
      } else {
        const hash = await write(
          props.contract.abi,
          props.contract.address,
          props.fn.name,
          inputs(),
        );
        setStatus({ type: "tx", hash });
      }
    } catch (e) {
      setStatus({
        type: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class={styles.item}>
      <div class={styles.itemHeader}>
        <div class={styles.itemInfo}>
          <span class={styles.itemName}>{props.fn.name}</span>
          <Show when={outputLabel}>
            <span class={styles.itemOutput}>➔ {outputLabel}</span>
          </Show>
        </div>
        <button class={styles.callBtn} disabled={loading()} onClick={execute}>
          {loading() ? "..." : "call"}
        </button>
      </div>

      <Show when={props.fn.inputs.length > 0}>
        <div class={styles.inputs}>
          <For each={props.fn.inputs}>
            {(input) => (
              <div class={styles.param}>
                <span class={styles.paramName}>{input.name}</span>
                <input
                  class={styles.paramInput}
                  placeholder={shortType(input.type)}
                  value={inputs()[input.name]}
                  onInput={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [input.name]: e.currentTarget.value,
                    }))
                  }
                />
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={status()}>
        {(s) => (
          <div class={styles.result}>
            <Switch>
              <Match when={s().type === "error"}>
                <span class={styles.resultError}>
                  {(s() as Extract<CallStatus, { type: "error" }>).message}
                </span>
              </Match>
              <Match when={s().type === "tx"}>
                <span class={styles.resultMeta}>tx </span>
                <span class={styles.resultValue}>
                  {(s() as Extract<CallStatus, { type: "tx" }>).hash}
                </span>
              </Match>
              <Match when={s().type === "result"}>
                <For
                  each={(s() as Extract<CallStatus, { type: "result" }>).values}
                >
                  {(val) => <span class={styles.resultValue}>{val}</span>}
                </For>
              </Match>
            </Switch>
          </div>
        )}
      </Show>
    </div>
  );
}
