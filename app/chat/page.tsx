"use client";

// The composer-first draft route. No conversation is created until the first
// message is sent, so opening this page and leaving costs nothing.

import ChatScreen from "@/components/chat/ChatScreen";

export default function ChatPage() {
  return <ChatScreen conversationId={null} />;
}
