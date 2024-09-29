"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "ai/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
  });

  const [lastSubmittedUrl, setLastSubmittedUrl] = useState("");
  const [videoId, setVideoId] = useState("");

  const renderMarkdown = (content: string) => {
    let lastWasH2 = false;
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        const element = (
          <>
            {lastWasH2 && <hr className="my-6 border-t border-gray-300" />}
            <h2 key={index} className="text-2xl font-semibold mt-5 mb-3">{line.substring(3)}</h2>
          </>
        );
        lastWasH2 = true;
        return element;
      } else if (line.startsWith('### ')) {
        lastWasH2 = false;
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        lastWasH2 = false;
        return <li key={index} className="ml-6 list-disc mb-2">{line.substring(2)}</li>;
      } else if (line.match(/^(.+?):$/)) {
        lastWasH2 = false;
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line}</h3>;
      } else if (line.match(/\*\*(.*?)\*\*/)) {
        lastWasH2 = false;
        return (
          <h3 key={index} className="text-xl font-semibold mt-4 mb-2">
            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
          </h3>
        );
      } else {
        lastWasH2 = false;
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input !== lastSubmittedUrl) {
      setMessages([]); // Clear previous messages
      setLastSubmittedUrl(input);
      const newVideoId = new URL(input).searchParams.get("v");
      setVideoId(newVideoId || "");
    }
    handleSubmit(e);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Summarizer</h1>
      
      <Alert className="mb-4 flex items-center">
        <InfoIcon size={16} className="mr-2" />
        <AlertDescription>
          Note: Summarizing longer videos may take some time. Please be patient while we process your request.
        </AlertDescription>
      </Alert>

      <form
        onSubmit={handleFormSubmit}
        className="mb-4 flex flex-col sm:flex-row gap-3"
      >
        <Input
          type="url"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter YouTube URL"
          className="flex-grow"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Summarizing..." : "Summarize"}
        </Button>
      </form>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {videoId && (
          <div className="lg:w-1/2">
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className={videoId ? "lg:w-1/2" : "w-full"}>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((m) => (
                  <div key={m.id}>
                    {m.role === 'assistant' && renderMarkdown(m.content)}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Enter a YouTube URL and click "Summarize" to get started.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}