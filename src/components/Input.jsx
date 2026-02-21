const Input = ({
  input,
  setInput,
  handleSendMessage,
  recording,
  startRecording,
  stopRecording,
  audioURL,
}) => {
  return (
    <div className="p-3 border-t flex item-center gap-2 bg-gray-400">
      {recording && (
        <div className="text-red-600 font-semibold animate-pulse">
          🔴 Recording...
        </div>
      )}
      {audioURL ? (
        <audio controls src={audioURL} className="flex-1" />
      ) : (
        <input
          type="text"
          value={input}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          placeholder="Type a message..."
          onChange={(e) => {
            console.log(e.target.value);
            setInput(e.target.value)
          }}
        />
      )}
      <button onClick={recording ? stopRecording : startRecording} className={`p-3 rounded-full`}>🎤</button>
      <button onClick={handleSendMessage} className="bg-green-500 text-white px-4 py-2 rounded-full">
        Send
      </button>
    </div>
  );
};

export default Input;
