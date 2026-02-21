import React, { useState, useRef } from "react";
import Header from "../components/Header";
import Messages from "../components/Messages";
import Input from "../components/Input";

const VoiceChat = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState([
    { type: "text", text: "Hello, how are you?", sender: "bot" },
  ]);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunk = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      chunk.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunk.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      chunk.current = [];
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleSendMessage = (text = input) => {
    if (text.trim()) {
      const newMessage = { type: "text", text, sender: "user" };
      setMessage((prev) => [...prev, newMessage]);
      setInput("");
    } else if (audioURL) {
        const newMessage = {
            type: "audio",
            audioURL,
            sender: "user"
        };
      setMessage((prev) => [
        ...prev,
        newMessage
      ]);
      setAudioURL(null);
    }
  };

  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-10 h-16">
        <Header />
      </div>

      <div className="pt-16 pb-16 h-screen overflow-y-auto px-4 overflow-x-hidden">
        <Messages message={message} />
      </div>

      <div className="fixed bottom-0 left-0 w-full">
        <Input
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          startRecording={startRecording}
          stopRecording={stopRecording}
          recording={recording}
          audioURL={audioURL}
        />
      </div>
    </div>
  );
};

export default VoiceChat;
