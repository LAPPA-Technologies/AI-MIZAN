import ChatAccessGate from "../../components/ChatAccessGate";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatAccessGate>{children}</ChatAccessGate>;
}
