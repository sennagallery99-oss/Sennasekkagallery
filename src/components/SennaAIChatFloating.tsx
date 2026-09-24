import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  Minimize2, 
  Maximize2,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { sendGeminiChatMessage, ChatMessage } from '../services/geminiClient';
import { ADMIN_WA_NUMBER } from '../data/packagesData';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSewaStore } from '../store/sewaStore';

export const SennaAIChatFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! ✨ Saya **Senna AI Stylist**, asisten resmi *sennagallery.com*.\n\nAda yang bisa saya bantu terkait **sewa kebaya, jas, gaun pengantin**, paket rias **Senna MUA**, atau dekorasi pelaminan **Sekka Design**?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const products = useSewaStore((state) => state.products);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isOpen, isMinimized]);

  // Quick suggestions
  const QUICK_QUESTIONS = [
    { label: '👗 Rekomendasi Kebaya Pengantin', prompt: 'Bisa rekomendasikan kebaya pengantin modern dan adat yang tersedia di Senna Gallery?' },
    { label: '🤵 Koleksi Jas & Tuxedo Pria', prompt: 'Apa saja pilihan jas dan tuxedo pria untuk pengantin di Senna Gallery?' },
    { label: '💍 Paket Wedding & MUA Lengkap', prompt: 'Bisa jelaskan paket pernikahan all-in (MUA + Dekorasi + Busana) di Senna Gallery?' },
    { label: '📋 Syarat & Durasi Sewa Busana', prompt: 'Bagaimana cara dan syarat menyewa busana di Senna Gallery? Berapa hari durasi dan depositnya?' },
    { label: '📍 Lokasi Studio & Jadwal Fitting', prompt: 'Di mana lokasi studio Senna Gallery di Bandar Lampung dan bagaimana cara jadwal fitting?' },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for API
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Detect if user is currently viewing a product detail page
      let activeProductContext: any = undefined;
      const match = location.pathname.match(/\/sewa\/katalog\/([^\/]+)/);
      if (match && match[1]) {
        const found = products.find((p) => p.id === match[1]);
        if (found) {
          activeProductContext = {
            name: found.name,
            category: found.category,
            categoryLabel: found.categoryLabel,
            price: found.price,
            priceFormatted: found.priceFormatted,
            material: found.material,
            description: found.description,
            inclusions: found.inclusions,
          };
        }
      }

      const result = await sendGeminiChatMessage(history, activeProductContext);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          text: 'Maaf, terjadi gangguan koneksi. Anda juga dapat langsung bertanya ke Admin WhatsApp kami di 0812-7883-9990.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(
      'Halo Admin Senna Gallery & Sekka Decoration, saya ingin konsultasi langsung seputar sewa busana dan paket wedding studio.'
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Format markdown bold & links
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Parse bold tags **text**
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pIdx} className="italic text-stone-800">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Always visible at bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex items-center gap-2 animate-bounce-subtle">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-orange-500/20 border border-amber-400/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Tanya Senna AI"
          >
            {/* Sparkle Glow Dot */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-stone-900 rounded-full" />
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider leading-none">
                AI Wedding Stylist
              </span>
              <span className="text-xs font-bold text-white leading-tight">
                Tanya Senna AI
              </span>
            </div>

            {/* Mobile simplified label */}
            <span className="sm:hidden text-xs font-bold text-amber-200">
              Tanya AI
            </span>
          </button>
        </div>
      )}

      {/* EXPANDED CHAT DIALOG */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-[64px]' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* HEADER */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Senna AI Assistant
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
                </div>
                <span className="text-[10px] text-amber-200 block">
                  Spesialis sennagallery.com &amp; Sewa Busana
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title={isMinimized ? 'Perbesar' : 'Minimalkan'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT BODY (HIDDEN WHEN MINIMIZED) */}
          {!isMinimized && (
            <>
              {/* GUARDRAIL NOTICE BANNER */}
              <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200/60 flex items-center justify-between text-[10px] text-amber-900">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Konsultan resmi produk &amp; katalog Senna Gallery</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="font-bold text-amber-900 hover:underline flex items-center gap-0.5"
                >
                  <Phone className="w-2.5 h-2.5" /> WA Admin
                </button>
              </div>

              {/* MESSAGES LIST */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FAF8F5]/80 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] p-3 rounded-2xl shadow-3xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-tr-none font-medium'
                          : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                      }`}
                    >
                      {renderMessageContent(msg.text)}
                      <span
                        className={`text-[9px] block text-right mt-1.5 ${
                          msg.role === 'user' ? 'text-white/75' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* LOADING TYPING INDICATOR */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center text-stone-500 text-xs pl-1">
                    <div className="w-7 h-7 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    </div>
                    <div className="bg-white border border-stone-200 px-3.5 py-2 rounded-2xl rounded-tl-none shadow-3xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-stone-500 ml-1">Senna AI sedang berpikir...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK PROMPT SUGGESTIONS */}
              <div className="p-2 bg-stone-50 border-t border-stone-200 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q.prompt)}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 hover:text-stone-900 rounded-full whitespace-nowrap shadow-3xs transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT BAR */}
              <div className="p-3 bg-white border-t border-stone-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tanya seputar busana, rias & dekorasi..."
                    disabled={isLoading}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2.5 text-xs text-stone-900 focus:bg-white focus:border-red-500 outline-hidden transition"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white flex items-center justify-center shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    title="Kirim Pesan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
