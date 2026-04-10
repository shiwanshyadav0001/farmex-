import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { Mic, MicOff, MessageCircle, Send, Volume2, VolumeX } from 'lucide-react';
import { formatResponseContent } from '@/lib/formatResponse';
import { useTranslation } from '@/i18n';
import LiveFeatureScene from '@/components/motion/LiveFeatureScene';

const AnimatedMessage = ({ content, animate }) => {
  const [displayedText, setDisplayedText] = useState(animate ? '' : content);
  useEffect(() => {
    if (!animate) {
      setDisplayedText(content);
      return;
    }
    let index = 0;
    const timer = setInterval(() => {
      index++;
      setDisplayedText(content.substring(0, index));
      if (index >= content.length) clearInterval(timer);
    }, 10);
    return () => clearInterval(timer);
  }, [content, animate]);
  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayedText || ' '}</p>;
};

const languageCodes = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

function VoiceAssistant() {
  const { language, locale, t } = useTranslation();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const queueRef = useRef([]); // Holds sentences to be read
  const isPlayingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // --- 1. VOICE-TO-TEXT ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e) => { setMessage(e.results[0][0].transcript); setIsListening(false); };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); }
    else if (recognitionRef.current) {
      try { recognitionRef.current.lang = locale; recognitionRef.current.start(); setIsListening(true); }
      catch (err) { console.error(err); }
    } else { alert(t('Voice typing not supported.')); }
  };

  // --- 2. ROBUST SENTENCE-BY-SENTENCE READ ALOUD ---
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    queueRef.current = [];
    isPlayingRef.current = false;
    setCurrentlySpeaking(null);
  };

  const processQueue = () => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setCurrentlySpeaking(null);
      return;
    }

    isPlayingRef.current = true;
    const text = queueRef.current.shift();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 1. Force Marathi/Hindi Voice Selection
    const voices = window.speechSynthesis.getVoices();
    
    // CHAIN OF PREFERENCE:
    // a. Exact locale match (mr-IN)
    // b. Any voice with "marathi" in name
    // c. Fallback to Hindi (hi-IN) - Hindi voices can read Marathi text because script is same
    // d. Fallback to any Hindi voice
    // e. System default
    let targetVoice = voices.find(v => v.lang === locale || v.lang === locale.replace('-', '_'))
                     || voices.find(v => v.name.toLowerCase().includes('marathi'))
                     || voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN')
                     || voices.find(v => v.name.toLowerCase().includes('hindi'))
                     || voices.find(v => v.lang.startsWith(locale.split('-')[0]));
    
    if (targetVoice) {
      utterance.voice = targetVoice;
      // If we are using a Hindi voice for Marathi text, we must set lang to hi-IN
      // otherwise some engines will still try to process it as English
      utterance.lang = targetVoice.lang;
    } else {
      utterance.lang = locale;
    }

    utterance.rate = 0.85; 
    
    utterance.onend = () => processQueue();
    utterance.onerror = () => processQueue();

    window.speechSynthesis.speak(utterance);
  };

  const speakText = (text, index) => {
    if (!window.speechSynthesis) return;

    if (currentlySpeaking === index) {
      stopSpeaking();
      return;
    }

    stopSpeaking(); 

    // 2. AGGRESSIVE CLEANING
    let cleanText = text;

    // A. Handle Ranges (e.g., 20-30 becomes "20 to 30")
    if (language === 'hi') {
      cleanText = cleanText.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 से $2');
    } else if (language === 'mr') {
      cleanText = cleanText.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 ते $2');
    } else {
      cleanText = cleanText.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 to $2');
    }

    // B. Remove ALL other weird characters
    cleanText = cleanText
      .replace(/[*#_~`>\-\[\]()/\\|]/g, ' ') 
      .replace(/[\/\\]/g, ' ') 
      .replace(/(\d+)\./g, '$1 ') // "1." becomes "1 "
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const sentences = cleanText.split(/[.।\n!?;]/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return;

    queueRef.current = sentences;
    setCurrentlySpeaking(index);
    
    // 3. START PLAYING
    window.speechSynthesis.resume();
    processQueue();
  };

  useEffect(() => { return () => stopSpeaking(); }, []);

  // --- 3. API LOGIC ---
  const sendPrompt = async (text) => {
    if (!text.trim()) return;
    setLoading(true); setError('');
    setChatHistory(p => [...p, { role: 'user', content: text }]);
    try {
      const res = await axios.post(`${API}/chat/assistant`, { message: text, language });
      const ai = formatResponseContent(res.data.response);
      setChatHistory(p => [...p, { role: 'assistant', content: ai, animate: true }]);
    } catch (err) { setError(t('Connection error.')); setChatHistory(p => p.slice(0, -1)); }
    finally { setLoading(false); }
  };

  const exampleQuestions = {
    en: ['What crops should I plant in summer?', 'How do I treat leaf blight?', 'When is the best time to harvest wheat?', 'How much water does rice need?'],
    hi: ['गर्मी में मुझे कौन सी फसल लगानी चाहिए?', 'लीफ ब्लाइट का इलाज कैसे करूं?', 'गेहूं की कटाई का सबसे अच्छा समय क्या है?', 'धान को कितने पानी की जरूरत होती है?'],
    mr: ['उन्हाळ्यात मला कोणते पीक लावावे?', 'लीफ ब्लाइटवर उपचार कसे करावे?', 'गव्हाची कापणी करण्यासाठी सर्वोत्तम वेळ कोणती?', 'तांदळाला किती पाणी लागते?'],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const m = message; setMessage(''); sendPrompt(m);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#170912] via-[#220d1a] to-[#321025] p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <LiveFeatureScene type="voice" languageLabel={languageCodes[language]} isListening={isListening} chatCount={chatHistory.length} />
        </div>

        <div className="card border-0 shadow-2xl bg-white dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/20 rounded-full border border-pink-100 dark:border-pink-900/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-sm font-bold text-pink-700 dark:text-pink-400 uppercase tracking-tight">{languageCodes[language]} Mode</span>
          </div>

          <div className="mb-6 h-[450px] overflow-y-auto rounded-3xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-950/50 p-6 border border-slate-100 dark:border-slate-800">
            {chatHistory.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <MessageCircle className="mb-4 h-16 w-16 opacity-20" />
                <p className="font-medium text-center">{t('Ready to help with your crops')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="group flex items-start gap-3 max-w-[85%]">
                      <div className={`relative rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 dark:text-slate-100 rounded-tl-none'}`}>
                        {msg.role === 'user' ? <p className="text-sm font-medium">{msg.content}</p> : <AnimatedMessage content={msg.content} animate={msg.animate} />}
                      </div>
                      {msg.role === 'assistant' && (
                        <button onClick={() => speakText(msg.content, idx)} className={`p-2.5 rounded-full transition-all shadow-md border ${currentlySpeaking === idx ? 'bg-pink-600 border-pink-600 text-white scale-110' : 'bg-white dark:bg-slate-900 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-600 hover:bg-pink-50'}`}>
                          {currentlySpeaking === idx ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 flex gap-1 items-center"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('Ask a question...')} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-5 py-4 text-slate-800 dark:text-slate-200 dark:text-slate-100 focus:ring-2 focus:ring-pink-500 outline-none pr-14" disabled={loading} />
              <button type="button" onClick={toggleListening} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-pink-600'}`}>
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
            </div>
            <button type="submit" disabled={loading || !message.trim()} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-pink-200 dark:shadow-none"><Send className="h-5 w-5" /></button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {exampleQuestions[language].map((q, i) => (
              <button key={i} type="button" onClick={() => { setMessage(''); sendPrompt(q); }} className="text-xs font-semibold bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl hover:border-pink-400 transition-all shadow-sm" disabled={loading}>{q}</button>
            ))}
          </div>
          {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
