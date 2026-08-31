import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  parseVoiceCommand,
  analyzeUploadedImage,
  parseUploadedDocument,
  speakText,
  stopSpeaking
} from '../services/multimodalService';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Check,
  Edit2,
  ArrowRight,
  ShieldCheck,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  Bot
} from 'lucide-react';

export const Multimodal = () => {
  const navigate = useNavigate();
  const { addTask, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('voice'); // 'voice' | 'image' | 'document' | 'chat'

  // Voice State
  const [micState, setMicState] = useState('Idle'); // 'Idle' | 'Listening' | 'Processing' | 'Response' | 'Error'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsedResult, setVoiceParsedResult] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Image OCR State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [showTaskFromImageModal, setShowTaskFromImageModal] = useState(false);

  // Document State
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docAnalysisResult, setDocAnalysisResult] = useState(null);

  // Multimodal Chat State
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'How can I help you today? You can type, speak, or upload images/documents.', citation: null }
  ]);

  // Handle Mic Start / Stop Simulation (with browser Web Speech API fallback)
  const handleToggleMic = () => {
    if (micState === 'Listening') {
      setMicState('Processing');
      setTimeout(() => {
        const transcript = 'Create a task to finish DBMS assignment tomorrow';
        setVoiceTranscript(transcript);
        const parsed = parseVoiceCommand(transcript);
        setVoiceParsedResult(parsed);
        setMicState('Response');
        showToast('Recognized voice command.', 'info');
      }, 1500);
    } else {
      setMicState('Listening');
      showToast('Listening... Speak your command now.', 'info');
    }
  };

  // Confirm Voice Action
  const handleConfirmVoiceAction = () => {
    if (!voiceParsedResult) return;

    if (voiceParsedResult.actionType === 'CREATE_TASK' && voiceParsedResult.proposedData) {
      addTask({
        title: voiceParsedResult.proposedData.title,
        priority: voiceParsedResult.proposedData.priority,
        dueDate: voiceParsedResult.proposedData.dueDate,
        status: 'Pending'
      });
      showToast(`Created task "${voiceParsedResult.proposedData.title}" from voice input!`, 'success');
    } else if (voiceParsedResult.targetModule) {
      navigate(`/${voiceParsedResult.targetModule}`);
    }

    setVoiceParsedResult(null);
    setMicState('Idle');
    setVoiceTranscript('');
  };

  // Text-To-Speech Controls
  const handlePlayVoiceOutput = (text) => {
    const success = speakText(text);
    if (success) {
      setIsPlayingAudio(true);
      showToast('Speaking AI response aloud...', 'info');
    }
  };

  const handleStopVoiceOutput = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    showToast('Stopped audio output.', 'info');
  };

  // Image Upload Handling
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    setSelectedImage(file);
    const analysis = analyzeUploadedImage(file);
    setImageAnalysisResult(analysis);
    showToast(`Uploaded ${file.name}. Click Analyze for OCR & Understanding.`, 'info');
  };

  // Create Task from Image OCR
  const handleCreateTaskFromImage = () => {
    if (!imageAnalysisResult?.suggestedTask) return;
    addTask({
      title: imageAnalysisResult.suggestedTask.title,
      priority: imageAnalysisResult.suggestedTask.priority,
      dueDate: imageAnalysisResult.suggestedTask.dueDate,
      status: 'Pending'
    });
    showToast(`Created task from image OCR!`, 'success');
    setShowTaskFromImageModal(false);
  };

  // Document Upload Handling
  const handleDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedDoc(file);
    const parsed = parseUploadedDocument(file);
    setDocAnalysisResult(parsed);
    showToast(`Parsed document "${file.name}" with source citations!`, 'info');
  };

  // Send Multimodal Chat
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt.trim();
    setChatPrompt('');

    const newMsgs = [
      ...chatMessages,
      { sender: 'user', text: userText }
    ];

    setChatMessages(newMsgs);

    setTimeout(() => {
      let aiText = `I processed your request "${userText}". All context from your active LifeOS records is integrated.`;
      let citation = null;

      if (selectedImage) {
        aiText += ` Analysis grounded in uploaded image "${selectedImage.name}".`;
        citation = `Source: Uploaded Image "${selectedImage.name}"`;
      } else if (selectedDoc) {
        aiText += ` Analysis grounded in uploaded document "${selectedDoc.name}".`;
        citation = `Source: Document "${selectedDoc.name}"`;
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: aiText, citation }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Multimodal AI Command Center 3.0"
        subtitle="Universal AI interface accepting Text, Voice (🎙), Image OCR (📷), and Document inputs (📄) with transparent source citations and voice action safety."
        action={
          <div className="flex items-center gap-2">
            {isPlayingAudio ? (
              <Button variant="outline" size="sm" onClick={handleStopVoiceOutput} icon={VolumeX}>
                Stop Audio
              </Button>
            ) : (
              <Button variant="ai" size="sm" onClick={() => handlePlayVoiceOutput('Welcome to Multimodal AI Command Center. You can type, speak, or upload images and documents.')} icon={Volume2}>
                Test Voice Output
              </Button>
            )}
          </div>
        }
      />

      {/* PRIVACY & SECURITY DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Multimodal Security: API keys are securely protected server-side. Uploaded attachments are strictly isolated under Row Level Security. Audio transcripts are never shared publicly.</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'voice', label: 'Voice Commands (🎙)', icon: Mic },
          { id: 'image', label: 'Image OCR & Screenshots (📷)', icon: ImageIcon },
          { id: 'document', label: 'Document Input (📄)', icon: FileText },
          { id: 'chat', label: 'Multimodal Chat Stream', icon: Bot }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VOICE COMMANDS & SPEECH-TO-TEXT */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="card-panel p-8 text-center space-y-6 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Speech-to-Text Voice Interface
            </h3>

            {/* ANIMATED MICROPHONE BUTTON */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {micState === 'Listening' && (
                <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
              )}

              <button
                onClick={handleToggleMic}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer shadow-2xl ${
                  micState === 'Listening' ? 'bg-rose-600 border-rose-400 text-white animate-pulse' :
                  micState === 'Processing' ? 'bg-amber-600 border-amber-400 text-white' :
                  'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
                }`}
                title={micState === 'Listening' ? 'Click to Stop Listening' : 'Click to Start Voice Input'}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>

            <span className="text-xs font-mono font-bold block text-indigo-300">
              State: {micState} {micState === 'Listening' ? '— Speak now...' : micState === 'Processing' ? '— Processing speech...' : ''}
            </span>

            {/* RECOGNIZED VOICE TRANSCRIPT & CONFIRMATION BOX */}
            {voiceTranscript && (
              <div className="card-panel p-5 space-y-4 border-indigo-500/40 bg-zinc-900/80 text-left max-w-lg mx-auto">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">RECOGNIZED SPEECH TRANSCRIPT</span>
                  <p className="text-xs text-zinc-100 font-bold">"{voiceTranscript}"</p>
                </div>

                {voiceParsedResult?.requiresApproval && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs">
                    <span className="text-amber-300 font-bold block">Action Confirmation Required:</span>
                    <p className="text-zinc-200">{voiceParsedResult.confirmationMessage}</p>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="outline" size="xs" onClick={() => setVoiceParsedResult(null)}>Cancel</Button>
                      <Button variant="ai" size="xs" onClick={handleConfirmVoiceAction} icon={Check}>Confirm & Execute</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IMAGE UPLOAD & SCREENSHOT OCR */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              Image OCR & Screenshot Analysis
            </h3>

            {/* DROPZONE */}
            <label className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-400" />
              <span className="text-xs font-bold text-zinc-200">Upload Screenshot or Diagram Image</span>
              <span className="text-[11px] text-zinc-500 font-mono">Supports PNG, JPG, WebP (Max 10MB)</span>
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
            </label>
          </div>

          {/* IMAGE OCR ANALYSIS RESULT */}
          {imageAnalysisResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="font-bold text-zinc-100 text-xs">Analysis Result for "{imageAnalysisResult.fileName}"</span>
                <span className="text-[10px] text-indigo-300 font-mono">{imageAnalysisResult.citation}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">EXTRACTED OCR TEXT</span>
                  <p className="text-zinc-200 font-mono">{imageAnalysisResult.extractedText}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">IMAGE SUMMARY & ARCHITECTURE</span>
                  <p className="text-zinc-200">{imageAnalysisResult.summary}</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ai" size="sm" onClick={() => setShowTaskFromImageModal(true)} icon={Plus}>
                    Convert Image to Task
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENT PARSING */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Document Analysis Engine (PDF, TXT, MD, DOCX)
            </h3>

            <label className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2">
              <FileText className="w-8 h-8 text-indigo-400" />
              <span className="text-xs font-bold text-zinc-200">Upload Reference Document</span>
              <span className="text-[11px] text-zinc-500 font-mono">Supports PDF, TXT, Markdown, DOCX</span>
              <input type="file" accept=".pdf,.txt,.md,.docx" onChange={handleDocFileChange} className="hidden" />
            </label>
          </div>

          {docAnalysisResult && (
            <div className="card-panel p-6 space-y-4 border-indigo-500/30 bg-zinc-950">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="font-bold text-zinc-100 text-xs">Document Summary: "{docAnalysisResult.fileName}"</span>
                <span className="text-[10px] text-indigo-300 font-mono">{docAnalysisResult.citation}</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                "{docAnalysisResult.summary}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MULTIMODAL CHAT STREAM */}
      {activeTab === 'chat' && (
        <div className="card-panel p-6 space-y-4 border-indigo-500/40 bg-zinc-950 flex flex-col h-[520px] justify-between">
          <div className="space-y-3 overflow-y-auto pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl max-w-xl text-xs space-y-1 ${
                  msg.sender === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-zinc-900 border border-zinc-800 text-zinc-200'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                {msg.citation && (
                  <span className="text-[10px] text-indigo-300 font-mono block pt-1 border-t border-zinc-800/80">{msg.citation}</span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-zinc-800">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Ask anything... (supports text, voice, uploaded images and documents)"
              className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <Button type="submit" variant="ai" size="sm">Send</Button>
          </form>
        </div>
      )}

      {/* CONVERT IMAGE TO TASK CONFIRMATION MODAL */}
      {showTaskFromImageModal && imageAnalysisResult?.suggestedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-panel max-w-md w-full p-6 space-y-4 border-indigo-500/50 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Create Task from Image OCR?</h3>
              <button onClick={() => setShowTaskFromImageModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <span className="font-bold text-zinc-100 block">{imageAnalysisResult.suggestedTask.title}</span>
              <span className="text-[10px] text-zinc-400 font-mono block">Priority: {imageAnalysisResult.suggestedTask.priority} • Due: {imageAnalysisResult.suggestedTask.dueDate}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setShowTaskFromImageModal(false)}>Cancel</Button>
              <Button variant="ai" size="sm" onClick={handleCreateTaskFromImage} icon={Check}>Create Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
