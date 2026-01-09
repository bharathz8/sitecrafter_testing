import React, { useRef, useEffect } from 'react';
import { AgentMessage, AgentMessageData } from './AgentMessage';
import { ProcessingStep, ProcessingPhase } from './ProcessingStep';
import { UserInput } from './UserInput';
import { AgentStatus, AgentStatusType } from './AgentStatus';
import { Bot } from 'lucide-react';

interface ChatPanelProps {
    messages: AgentMessageData[];
    phases: ProcessingPhase[];
    status: AgentStatusType;
    statusMessage?: string;
    onSendMessage: (message: string) => void;
    onStop?: () => void;
    isProcessing: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    messages,
    phases,
    status,
    statusMessage,
    onSendMessage,
    onStop,
    isProcessing
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, phases]);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Status Bar */}
            <AgentStatus status={status} message={statusMessage} />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="w-16 h-16 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">
                            Welcome to SiteCrafter Agent
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md">
                            Describe the website you want to build, and I'll create it for you step by step.
                            I'll explain what I'm doing as I go.
                        </p>
                        {/* <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {['Portfolio website', 'E-commerce store', 'Restaurant landing page', 'Blog platform'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => onSendMessage(suggestion)}
                                    className="px-3 py-1.5 text-xs bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 rounded-full border border-[#2e2e2e] transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div> */}
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {messages.map((message) => (
                            <AgentMessage key={message.id} message={message} />
                        ))}

                        {/* Show processing steps when running */}
                        {isProcessing && phases.length > 0 && (
                            <ProcessingStep phases={phases} />
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <UserInput
                onSend={onSendMessage}
                onStop={onStop}
                isProcessing={isProcessing}
                placeholder={messages.length === 0 ? "Describe the website you want to build..." : "Send a follow-up message..."}
            />
        </div>
    );
};
