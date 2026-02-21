import React from "react";

const Messages = ({ message }) => {
  return (
    <div className="flex flex-col p-4 overflow-y-auto space-y-3">
      {message.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl max-w-xs ${
              msg.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {/* If text message */}
            {msg.type === "text" || msg.text ? (
              <div>
                <span className={`${msg.sender === 'user' ? "text-gray-300 " : "text-gray-700"} text-sm`}>{msg.sender}</span>
              <p>{msg.text}</p>
              </div>
            ) : null}

            {/* If audio message */}
            {msg.type === "audio" && msg.audioURL && (
              <audio
                controls
                src={msg.audioURL}
                className="mt-1"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Messages;
