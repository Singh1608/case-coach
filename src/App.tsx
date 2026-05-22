import { useState } from "react";
import { CASES } from "./data/cases";
import { useCaseChat } from "./hooks/useCaseChat";
import CaseSelect from "./components/CaseSelect";
import CaseChat from "./components/CaseChat";
import type { Case } from "./data/cases";

export default function App() {
  const [phase, setPhase] = useState<"select" | "chat">("select");
  const [filter, setFilter] = useState("All");
  const { selectedCase, messages, loading, startCase, sendMessage, resetCase } = useCaseChat();

  const filtered = filter === "All" ? CASES : CASES.filter((c) => c.type === filter);

  const handleSelectCase = async (c: Case) => {
    setPhase("chat");
    await startCase(c);
  };

  const handleBack = () => {
    resetCase();
    setPhase("select");
  };

  if (phase === "select") {
    return (
      <CaseSelect
        filter={filter}
        setFilter={setFilter}
        cases={filtered}
        onSelectCase={handleSelectCase}
      />
    );
  }

  return (
    <CaseChat
      selectedCase={selectedCase}
      messages={messages}
      loading={loading}
      onSendMessage={sendMessage}
      onBack={handleBack}
    />
  );
}
