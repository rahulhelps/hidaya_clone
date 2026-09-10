"use client";

// In Next 16 the `params` prop is a Promise. This page is a client component,
// so it reads the segment with useParams() instead of touching that prop.

import { useParams } from "next/navigation";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  return <ChatScreen conversationId={id} />;
}
