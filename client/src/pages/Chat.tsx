import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquare, ArrowLeft, Send, Trash2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Chat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: chatHistory, isLoading } = trpc.chat.getHistory.useQuery({ limit: 50 });
  const utils = trpc.useUtils();
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getHistory.invalidate();
      setMessage(""); // Auto-clear input after sending
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const clearHistory = trpc.chat.clearHistory.useMutation({
    onSuccess: () => {
      toast.success("Chat history cleared");
      utils.chat.getHistory.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to clear history: " + error.message);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate({ content: message.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-teal-600" />
              AI Health Coach
            </h1>
            <p className="text-muted-foreground">Get personalized advice powered by Grok</p>
          </div>
          {chatHistory && chatHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearHistory.mutate()}
              disabled={clearHistory.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Chat with Your AI Coach</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading chat history...</div>
            ) : chatHistory && chatHistory.length > 0 ? (
              <>
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">Thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about nutrition, weight loss, fasting, or supplements!
                </p>
              </div>
            )}
          </CardContent>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about your health journey..."
                disabled={sendMessage.isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Example Questions */}
        {(!chatHistory || chatHistory.length === 0) && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMessage("What are the best oils to use for cooking?")}>
              <CardContent className="p-4">
                <p className="text-sm font-medium">What are the best oils to use for cooking?</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMessage("How does intermittent fasting help with weight loss?")}>
              <CardContent className="p-4">
                <p className="text-sm font-medium">How does intermittent fasting help with weight loss?</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMessage("Should I take berberine or NMN?")}>
              <CardContent className="p-4">
                <p className="text-sm font-medium">Should I take berberine or NMN?</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMessage("Why is it so hard to keep weight off?")}>
              <CardContent className="p-4">
                <p className="text-sm font-medium">Why is it so hard to keep weight off?</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
