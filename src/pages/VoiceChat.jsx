import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Messages from "../components/Messages";
import Input from "../components/Input";

const VoiceChat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm Aarohan, your medical assistant. How can I help you today?" },
  ]);
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const sessionIdRef = useRef(crypto.randomUUID()); // stable for entire conversation
  const currentAudioRef = useRef(null);
  const recordedBlobRef = useRef(null);

  const startRecording = async () => {
    if (isProcessing) return;

    // Stop any playing audio if user interrupts
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      recordedBlobRef.current = audioBlob;
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSendMessage = () => {
    if (!recordedBlobRef.current) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "🎤 Voice message" },
    ]);

    sendToServer(recordedBlobRef.current);

    recordedBlobRef.current = null;
  };

  const sendToServer = async (audioBlob) => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("sessionId", sessionIdRef.current);

    try {
      const res = await fetch("http://localhost:3000/api/talk", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const { audio, history } = await res.json();

      if (history && Array.isArray(history)) {
        const uiMessages = [
          { sender: "bot", text: "Hi! I'm Aarohan, your medical assistant. How can I help you today?" },
          ...history
            .filter((turn) => {
              const text = turn.parts?.[0]?.text ?? "";
              return !text.startsWith("[SYSTEM:");
            })
            .map((turn) => ({
              sender: turn.role === "user" ? "user" : "bot",
              text: turn.parts?.[0]?.text ?? "",
            })),
        ];
        setMessages(uiMessages);
      }

      if (audio) {
        const audioEl = new Audio(`data:audio/wav;base64,${audio}`);
        currentAudioRef.current = audioEl;
        audioEl.onended = () => { currentAudioRef.current = null; };
        audioEl.play();
      }

    } catch (err) {
      console.error("Talk request failed:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsProcessing(false);
      setAudioURL(null)
    }
  };

  const getStatus = () => {
    if (recording) return "recording";
    if (isProcessing) return "processing";
    return "idle";
  };

  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-10 h-16">
        <Header />
      </div>

      <div className="pt-16 pb-16 h-screen overflow-y-auto px-4 overflow-x-hidden">
        <Messages message={messages} />
      </div>

      <div className="fixed bottom-0 left-0 w-full">
        <Input
          startRecording={startRecording}
          stopRecording={stopRecording}
          recording={recording}
          isProcessing={isProcessing}
          status={getStatus()}
          audioURL={audioURL}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default VoiceChat;