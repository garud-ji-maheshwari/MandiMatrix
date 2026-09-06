import { Mic, Send, Volume2, X } from "lucide-react";
import { useState } from "react";

import { sendChatMessage } from "../services/api.js";

export default function ChatWidget({ cropContext }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste. Ask about today prices, trend, or best selling time.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setMessage("");
    setMessages((items) => [...items, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        message: userMessage,
        cropContext,
      });
      setMessages((items) => [...items, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: error.response?.data?.message || "Chat service is not reachable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function listen() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((items) => [
        ...items,
        { role: "assistant", text: "Speech recognition is available in Chrome browsers." },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
    };
    recognition.start();
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {open && (
        <section className="mb-3 flex h-[min(520px,80vh)] w-[min(380px,calc(100vw-40px))] flex-col rounded-md border border-slate-200 bg-white shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">MandiSarthi</h2>
              <p className="text-xs text-slate-500">Hindi/Marathi voice supported by browser APIs</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close chat"
              aria-label="Close chat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`rounded-md px-3 py-2 text-sm ${
                  item.role === "user"
                    ? "ml-8 bg-market text-white"
                    : "mr-8 bg-slate-100 text-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span>{item.text}</span>
                  {item.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speak(item.text)}
                      title="Speak answer"
                      aria-label="Speak answer"
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-white"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-slate-500">Thinking...</p>}
          </div>

          <div className="flex gap-2 border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={listen}
              title="Speak question"
              aria-label="Speak question"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-market hover:bg-slate-50"
            >
              <Mic className="h-4 w-4" />
            </button>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="Ask in Hindi, Marathi, or English"
              className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
            />
            <button
              type="button"
              onClick={submit}
              title="Send message"
              aria-label="Send message"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-leaf text-white"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Open MandiSarthi"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-soil px-4 text-sm font-semibold text-white shadow-panel"
      >
        <MessageIcon />
        Chat
      </button>
    </div>
  );
}

function MessageIcon() {
  return <Send className="h-4 w-4" />;
}
