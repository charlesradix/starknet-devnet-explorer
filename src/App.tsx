import { createEffect, createSignal, Show } from "solid-js";
import { Header } from "./components/Header/Header.tsx";
import { ContractList } from "./components/ContractList/ContractList.tsx";
import { ContractDetail } from "./components/ContractDetail/ContractDetail.tsx";
import { TxPanel } from "./components/TxPanel/TxPanel.tsx";
import { Footer } from "./components/Footer/Footer.tsx";
import { useApp } from "./context/app.tsx";

export function App() {
  const { contracts } = useApp();
  const [selectedAddress, setSelectedAddress] = createSignal<string>();

  const selectedContract = () =>
    contracts().find((c) => c.address === selectedAddress());

  createEffect(() => {
    if (!selectedAddress() && contracts().length > 0) {
      setSelectedAddress(contracts()[0].address);
    }
  });

  return (
    <div class="app">
      <Header />
      <main class="main">
        <ContractList
          contracts={contracts()}
          selected={selectedAddress()}
          onSelect={setSelectedAddress}
        />
        <Show when={selectedContract()} fallback={<div class="empty" />}>
          {(contract) => <ContractDetail contract={contract()} />}
        </Show>
      </main>
      <TxPanel />
      <Footer />
    </div>
  );
}
