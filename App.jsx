import { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Terminal, Cpu, Activity, Zap, 
  Layers, Code, History, AlertCircle, CheckCircle2 
} from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  const analyzeText = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResult(null); // Clear previous result to show loading state purely

    try {
      const res = await fetch('http://localhost:5000/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      
      const data = await res.json();
      setResult(data);
      
      // Add to sidebar history
      setHistory(prev => [{
        id: Date.now(),
        text: input,
        intent: data.intent,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to Neural Engine." });
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to results
  useEffect(() => {
    if (result && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden text-slate-300 selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col hidden md:flex backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">Neuro<span className="text-indigo-400">Lingua</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Enterprise NLP</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <History size={12} />
            <span>Recent Queries</span>
          </div>
          
          {history.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-sm italic">
              No queries yet. <br/> System ready.
            </div>
          )}

          {history.map(item => (
            <button 
              key={item.id}
              onClick={() => setInput(item.text)}
              className="w-full text-left p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-indigo-500/30 transition-all group"
            >
              <div className="text-sm font-medium text-slate-200 truncate group-hover:text-white mb-1">
                {item.text}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400 border border-indigo-900/30">
                  {item.intent?.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-600">{item.time}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Status
            </div>
            <span className="text-emerald-500 font-medium">ONLINE</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-950/50 px-3 py-1.5 rounded-full border border-indigo-900">
              <Cpu size={14} />
              <span>MODEL: LLAMA-3.3-70B-versatile</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-300 bg-orange-950/30 px-3 py-1.5 rounded-full border border-orange-900/50">
              <Zap size={14} />
              <span>PROVIDER: GROQ CLOUD</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Terminal size={16} />
            <span>v2.4.0-stable</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Welcome / Empty State */}
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Activity size={64} className="text-slate-700 mb-4" />
                <h2 className="text-2xl font-light text-slate-400">Awaiting Neural Input</h2>
                <p className="text-slate-600 mt-2">Enter any text to classify intent, entities, and sentiment.</p>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-delay-150"></div>
                </div>
                <p className="mt-6 font-mono text-indigo-400 animate-pulse">Running Inference...</p>
              </div>
            )}

            {/* RESULT DASHBOARD */}
            {result && !loading && !result.error && (
              <div className="animate-fade-in-up space-y-6">
                
                {/* Top Row: KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Intent Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Activity size={40} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Detected Intent</h3>
                    <div className="text-2xl font-bold text-white capitalize break-words">
                      {result.intent?.replace(/_/g, ' ')}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" 
                          style={{ width: `${(result.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-cyan-400">{Math.round((result.confidence || 0) * 100)}%</span>
                    </div>
                  </div>

                  {/* Sentiment Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Layers size={40} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sentiment</h3>
                    <div className={`text-2xl font-bold capitalize ${
                      result.sentiment === 'positive' ? 'text-emerald-400' : 
                      result.sentiment === 'negative' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {result.sentiment}
                    </div>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                      {result.suggested_action || "No immediate action required."}
                    </p>
                  </div>

                  {/* Performance Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={40} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">System Metrics</h3>
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Latency</span>
                        <span className="font-mono text-emerald-400">{result.meta?.latency_ms}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tokens</span>
                        <span className="font-mono text-slate-300">~{input.length / 4}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Category</span>
                        <span className="font-mono text-amber-400">{result.category || 'General'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Entities & JSON */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Entities Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                      <Layers size={18} />
                      <h3 className="font-bold text-sm uppercase tracking-wide">Extracted Entities</h3>
                    </div>
                    
                    {result.entities && result.entities.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {result.entities.map((ent, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 flex flex-col shadow-sm">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">{ent.type}</span>
                            <span className="text-slate-200 font-medium">{ent.value || ent.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-950/50 rounded-lg border border-dashed border-slate-800 text-center text-slate-600 text-sm">
                        No named entities identified in text.
                      </div>
                    )}
                  </div>

                  {/* JSON Viewer */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                        <Code size={14} />
                        RAW_JSON_OUTPUT
                      </div>
                      <span className="text-[10px] text-slate-600">ReadOnly</span>
                    </div>
                    <pre className="flex-1 p-4 text-xs font-mono text-blue-300 overflow-auto max-h-60 bg-[#0B1120]">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>

                <div ref={bottomRef}></div>
              </div>
            )}
            
            {/* Error State */}
            {result?.error && (
              <div className="bg-red-900/10 border border-red-900/50 p-4 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle size={20} />
                <div>
                  <h4 className="font-bold text-sm">Processing Error</h4>
                  <p className="text-xs opacity-80">{result.details || "The system could not parse the response."}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 z-20">
          <form onSubmit={analyzeText} className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl overflow-hidden">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to analyze (e.g., 'Schedule a high priority meeting with Engineering for tomorrow at 2 PM')"
                className="w-full bg-transparent text-white px-6 py-4 outline-none placeholder:text-slate-600"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="mr-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-0 disabled:translate-x-4"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          <div className="text-center mt-3 text-[10px] text-slate-600 font-mono">
            Powered by Groq LPU™ & Llama 3 • Latency &lt; 300ms
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
