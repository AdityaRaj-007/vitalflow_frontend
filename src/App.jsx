import { useState } from "react";
import VoiceChat from "./pages/VoiceChat";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      <VoiceChat />
    </div>
  );
}

export default App;
