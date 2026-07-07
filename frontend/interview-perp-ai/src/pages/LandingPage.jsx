import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuSparkles, LuBriefcase, LuBrain, LuMic, LuTarget, 
  LuChevronDown, LuArrowRight,
  LuMessageSquare
} from 'react-icons/lu';
import Modal from '../components/Modal';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const DEMO_SCENARIOS = [
  {
    category: "Frontend Engineer • React",
    question: "How does React's Virtual DOM actually improve performance?",
    answer: "It updates faster because it doesn't repaint everything, only the changed parts.",
    score: 70,
    status: "Partial Match",
    critique: "You understand the 'what', but missed the 'how'.",
    missingConcepts: ["Reconciliation", "Batching"]
  },
  {
    category: "Backend Engineer • System Design",
    question: "When would you choose Redis over Memcached?",
    answer: "I'd use Redis for caching since it's fast.",
    score: 40,
    status: "Too Vague",
    critique: "Both are fast in-memory stores. You must mention data structures.",
    missingConcepts: ["Data Persistence", "Complex Data Types"]
  },
  {
    category: "DevOps Engineer • Kubernetes",
    question: "What happens when a Kubernetes pod crashes?",
    answer: "The pod stops working and you have to restart it manually.",
    score: 20,
    status: "Incorrect",
    critique: "Kubernetes is self-healing. It handles this automatically.",
    missingConcepts: ["ReplicaSet", "Kubelet Restarts", "Self-Healing"]
  },
  {
    category: "Software Engineer • Behavioral",
    question: "Tell me about a time you disagreed with a senior engineer.",
    answer: "I just did what they said because they had more experience.",
    score: 50,
    status: "Weak Signal",
    critique: "Interviewers want to see principled pushback and data-driven decisions.",
    missingConcepts: ["Data-Driven Pushback", "Compromise"]
  },
  {
    category: "Full Stack Engineer • Databases",
    question: "Explain the N+1 query problem.",
    answer: "It's when you run a query inside a loop, making too many database calls.",
    score: 95,
    status: "Strong Match",
    critique: "Great concise definition! To be perfect, mention a solution.",
    missingConcepts: ["Eager Loading (JOINs)"]
  }
];

const FAQ_DATA = [
  {
    question: "Who is Interview Prep AI for?",
    answer: "Software engineers preparing for mid to senior-level system design, backend, and frontend interviews at top tech companies."
  },
  {
    question: "Do I need to memorize the answers?",
    answer: "No. Memorization fails under pressure. Our AI helps you understand the underlying concepts so you can answer any variation of the question."
  },
  {
    question: "Can I use this for Behavioral interviews?",
    answer: "Yes! We generate role-specific behavioral scenarios and our AI critiques your answers using the STAR method."
  },
  {
    question: "Is this just ChatGPT?",
    answer: "No. While powered by LLMs, it's a structured platform with curated interview workflows, spaced-repetition, and targeted feedback criteria you won't get from a chat window."
  }
];

const ScoreCounter = ({ targetScore }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = targetScore / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setCount(targetScore);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [targetScore]);

  return <div className="text-3xl font-display font-bold">{count}</div>;
};

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  
  // Interactive states
  const [demoStep, setDemoStep] = useState(0); // 0: input, 1: analyzing, 2: result, 3: crossfading
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  // Initialize random scenario
  useEffect(() => {
    const saved = localStorage.getItem('interview_prep_demo_index');
    if (saved !== null) {
      setScenarioIndex(parseInt(saved, 10));
    } else {
      const rand = Math.floor(Math.random() * DEMO_SCENARIOS.length);
      setScenarioIndex(rand);
      localStorage.setItem('interview_prep_demo_index', rand.toString());
    }
  }, []);

  // Auto-loop state machine
  useEffect(() => {
    if (isHovered) return; // Pause timers on hover

    let timer;
    if (demoStep === 0) {
      timer = setTimeout(() => setDemoStep(1), 2500);
    } else if (demoStep === 1) {
      timer = setTimeout(() => setDemoStep(2), 1500);
    } else if (demoStep === 2) {
      timer = setTimeout(() => setDemoStep(3), 4000);
    } else if (demoStep === 3) {
      timer = setTimeout(() => {
        setScenarioIndex((prev) => (prev + 1) % DEMO_SCENARIOS.length);
        setDemoStep(0);
      }, 500); // Wait for crossfade CSS
    }

    return () => clearTimeout(timer);
  }, [demoStep, isHovered]);

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const workflowSteps = [
    { icon: <LuBriefcase className="w-5 h-5" />, title: "Target Your Role", desc: "Select the specific engineering role you're interviewing for." },
    { icon: <LuBrain className="w-5 h-5" />, title: "Generate Deck", desc: "AI builds a hyper-relevant question bank instantly." },
    { icon: <LuMessageSquare className="w-5 h-5" />, title: "Understand", desc: "Don't memorize. Read AI-generated, deep-dive explanations." },
    { icon: <LuMic className="w-5 h-5" />, title: "Practice Aloud", desc: "Speak your answers and get critiqued like a real interview." },
    { icon: <LuTarget className="w-5 h-5" />, title: "Master", desc: "Track weak areas and use spaced repetition to improve." }
  ];

  return (
    <div data-theme="light" className="bg-cream text-charcoal overflow-x-hidden font-body selection:bg-charcoal selection:text-cream">
      
      {/* -------------------- HEADER -------------------- */}
      <header className='sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b-2 border-charcoal'>
        <div className='container mx-auto px-4 h-16 flex justify-between items-center'>
          <div className='text-xl md:text-2xl font-display font-bold text-charcoal flex items-center gap-2'>
            <div className="w-6 h-6 bg-charcoal rounded-sm flex items-center justify-center">
              <span className="text-cream text-xs font-bold">IP</span>
            </div>
            Interview Prep AI
          </div>
          {user ? (
            <ProfileInfoCard />
          ) : (
            <button
              className='bg-charcoal text-cream px-5 py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)] transition-all cursor-pointer'
              onClick={() => setOpenAuthModal(true)}
            >
              Start for Free
            </button>
          )}
        </div>
      </header>

      {/* -------------------- HERO SECTION -------------------- */}
      <div className='w-full bg-cream relative pt-20 pb-32 border-b-2 border-charcoal overflow-hidden'>
        <div className='w-[400px] h-[400px] bg-amber-200/20 blur-[80px] absolute top-10 left-0 pointer-events-none' />
        
        <div className='container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16'>
          
          {/* Left Text */}
          <div className='w-full lg:w-1/2 flex flex-col items-center text-center lg:items-start lg:text-left'>
            <div className='flex items-center gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-sm border-2 border-charcoal uppercase tracking-wider mb-8 shadow-[2px_2px_0px_0px_#1A1A1A]'>
              <LuSparkles className="text-crimson" /> AI-Powered Preparation
            </div>
            
            <h1 className='text-5xl md:text-6xl lg:text-[4.5rem] font-display text-charcoal leading-[1.1] mb-8'>
              Master Technical Interviews, <br className="hidden md:block" />
              <span className='italic text-charcoal/70'>Not Just Memorize Answers.</span>
            </h1>
            
            <p className='text-lg md:text-xl text-charcoal/80 mb-10 max-w-xl leading-relaxed'>
              Generate role-specific questions, dive deep into concepts with AI explanations, practice speaking aloud, and get critiqued instantly.
            </p>
            
            <button
              className='bg-charcoal text-cream text-sm font-bold uppercase tracking-wider px-10 py-5 rounded-sm hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,0.2)] transition-all cursor-pointer flex items-center gap-3 group'
              onClick={handleCTA}
            >
              Start Practicing
              <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Interactive Preview */}
          <div className='w-full lg:w-1/2'>
          <div 
            className="w-full max-w-4xl mx-auto text-left bg-white border-4 border-charcoal shadow-[8px_8px_0px_0px_#1A1A1A] rounded-sm flex flex-col relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            
            {/* Header / Meta */}
            <div className="h-12 border-b-2 border-charcoal bg-cream/30 flex items-center justify-between px-6 shrink-0 transition-opacity duration-500" style={{ opacity: demoStep === 3 ? 0 : 1 }}>
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal/50">{DEMO_SCENARIOS[scenarioIndex].category}</div>
              <div className="flex gap-2 items-center">
                {isHovered && <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest animate-pulse mr-2">Paused</span>}
                <div className="w-2 h-2 rounded-full bg-charcoal/20"></div>
                <div className="w-2 h-2 rounded-full bg-charcoal/20"></div>
                <div className="w-2 h-2 rounded-full bg-charcoal/20"></div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex flex-col min-h-[220px] transition-opacity duration-500" style={{ opacity: demoStep === 3 ? 0 : 1 }}>
              
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-charcoal text-cream text-xs font-bold px-2 py-1 rounded-sm shrink-0">Q</div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-charcoal leading-tight">
                    "{DEMO_SCENARIOS[scenarioIndex].question}"
                  </h3>
                </div>
              </div>

              {/* Dynamic State Area */}
              <div className="flex-1 relative">
                
                {/* State 0: Input */}
                <div className={`absolute inset-0 transition-all duration-300 ${demoStep === 0 ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
                  <div className="flex flex-col gap-4">
                    <div className="bg-cream/50 border-2 border-charcoal border-dashed p-4 rounded-sm flex items-start gap-3">
                      <LuMic className="w-5 h-5 text-crimson shrink-0 mt-0.5 animate-pulse" />
                      <p className="italic text-charcoal/70 text-sm leading-relaxed">
                        "{DEMO_SCENARIOS[scenarioIndex].answer}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* State 1: Analyzing */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${demoStep === 1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  <LuSparkles className="w-8 h-8 text-crimson animate-pulse mb-3" />
                  <div className="text-sm font-bold uppercase tracking-wider text-charcoal mb-4">AI Analyzing Transcript...</div>
                  <div className="w-64 h-2 bg-cream border-2 border-charcoal rounded-full overflow-hidden">
                    <div className="w-full h-full bg-charcoal animate-[shimmer_1.5s_infinite] origin-left"></div>
                  </div>
                </div>

                {/* State 2: Result */}
                <div className={`absolute inset-0 transition-all duration-300 ${demoStep === 2 ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}>
                  <div className="flex flex-col sm:flex-row items-start gap-6 h-full">
                    
                    {/* Score Box */}
                    <div className="w-24 h-24 shrink-0 bg-charcoal text-cream rounded-sm flex flex-col items-center justify-center p-2">
                      {demoStep === 2 ? <ScoreCounter targetScore={DEMO_SCENARIOS[scenarioIndex].score} /> : <div className="text-3xl font-display font-bold">0</div>}
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">Score</div>
                    </div>
                    
                    {/* Critique */}
                    <div className="flex-1 flex flex-col h-full justify-between w-full">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`border-2 border-charcoal text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                            DEMO_SCENARIOS[scenarioIndex].score >= 90 ? 'bg-green-200 text-charcoal' : 
                            DEMO_SCENARIOS[scenarioIndex].score >= 60 ? 'bg-amber-200 text-charcoal' : 
                            'bg-red-200 text-charcoal'
                          }`}>
                            {DEMO_SCENARIOS[scenarioIndex].status}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal font-bold mb-1">{DEMO_SCENARIOS[scenarioIndex].critique}</p>
                        
                        {/* Missing Concepts Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-charcoal/50 mr-1 mt-0.5">Missing keywords:</span>
                          {DEMO_SCENARIOS[scenarioIndex].missingConcepts.map((concept, i) => (
                            <span key={i} className="text-[11px] font-bold text-charcoal bg-cream border border-charcoal px-2 py-0.5 rounded-sm shadow-[1px_1px_0px_0px_#1A1A1A]">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* -------------------- INTERACTIVE WORKFLOW -------------------- */}
      <div className="w-full bg-white border-b-2 border-charcoal py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-16">
            <h2 className='text-4xl md:text-5xl font-display font-bold text-charcoal mb-4'>
              The Path to Readiness
            </h2>
            <p className="text-lg text-charcoal/70 max-w-xl">
              Hover over the steps to see how we turn raw experience into compelling interview answers.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Steps Left */}
            <div className="w-full md:w-1/3 flex flex-col relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-charcoal/10 -z-10"></div>
              {workflowSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setActiveWorkflowStep(idx)}
                  className={`flex items-start gap-5 p-4 rounded-sm cursor-pointer transition-all duration-300 ${activeWorkflowStep === idx ? 'bg-cream border-2 border-charcoal translate-x-2 shadow-[4px_4px_0px_0px_#1A1A1A]' : 'hover:bg-cream/50 border-2 border-transparent'}`}
                >
                  <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-sm border-2 border-charcoal bg-white ${activeWorkflowStep === idx ? 'text-crimson' : 'text-charcoal'}`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal text-lg mb-1">{step.title}</h4>
                    <p className="text-sm text-charcoal/60 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Preview Right */}
            <div className="w-full md:w-2/3 h-[450px] bg-cream border-4 border-charcoal rounded-sm shadow-[8px_8px_0px_0px_#1A1A1A] p-8 flex items-center justify-center relative overflow-hidden">
              {/* Step 0: Role */}
              <div className={`absolute inset-0 p-8 transition-opacity duration-500 flex flex-col justify-center items-center ${activeWorkflowStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="bg-white border-2 border-charcoal p-6 rounded-sm w-full max-w-sm shadow-[4px_4px_0px_0px_#1A1A1A]">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2 block">Target Role</label>
                  <div className="border-2 border-charcoal p-3 flex justify-between items-center bg-cream mb-4">
                    <span className="font-bold">Senior Backend Engineer</span>
                    <LuChevronDown />
                  </div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2 block">Domain</label>
                  <div className="border-2 border-charcoal p-3 flex justify-between items-center bg-cream mb-6">
                    <span className="font-bold">System Design & Node.js</span>
                    <LuChevronDown />
                  </div>
                  <button className="w-full bg-charcoal text-cream font-bold uppercase py-3 text-sm">Generate Questions</button>
                </div>
              </div>

              {/* Step 1: Generate */}
              <div className={`absolute inset-0 p-8 transition-opacity duration-500 ${activeWorkflowStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-white border-2 border-charcoal p-4 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A1A1A]">
                       <div className="w-3/4">
                         <div className="h-4 bg-charcoal/10 rounded w-full mb-2"></div>
                         <div className="h-4 bg-charcoal/10 rounded w-2/3"></div>
                       </div>
                       <div className="w-8 h-8 rounded-full border-2 border-charcoal flex items-center justify-center bg-cream">
                         <span className="text-xs font-bold">{i}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Step 2: Understand */}
              <div className={`absolute inset-0 p-8 transition-opacity duration-500 flex items-center justify-center ${activeWorkflowStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="bg-white border-2 border-charcoal p-6 w-full shadow-[4px_4px_0px_0px_#1A1A1A]">
                   <div className="flex gap-2 mb-4">
                     <LuSparkles className="text-crimson" />
                     <span className="text-xs font-bold uppercase tracking-wider">Concept Breakdown</span>
                   </div>
                   <div className="space-y-3">
                     <div className="h-3 bg-charcoal/10 rounded w-full"></div>
                     <div className="h-3 bg-charcoal/10 rounded w-full"></div>
                     <div className="h-3 bg-charcoal/10 rounded w-5/6"></div>
                   </div>
                   <div className="mt-6 p-4 bg-charcoal text-green-400 font-mono text-xs rounded-sm">
                     {`const retryFetch = async (url) => {`}
                     <br/>{`  // Exponential backoff`}
                     <br/>{`};`}
                   </div>
                </div>
              </div>

              {/* Step 3: Practice */}
              <div className={`absolute inset-0 p-8 transition-opacity duration-500 flex items-center justify-center ${activeWorkflowStep === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="text-center w-full max-w-sm">
                  <div className="w-24 h-24 rounded-full border-4 border-charcoal bg-white mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#1A1A1A] mb-8 relative">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <LuMic className="w-10 h-10 text-charcoal" />
                  </div>
                  <div className="bg-white border-2 border-charcoal p-4 rounded-sm italic text-charcoal/70">
                    "So, the way I would approach scaling this microservice is by first implementing..."
                  </div>
                </div>
              </div>

              {/* Step 4: Master */}
              <div className={`absolute inset-0 p-8 transition-opacity duration-500 flex items-center justify-center ${activeWorkflowStep === 4 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="bg-white border-2 border-charcoal p-8 w-full shadow-[4px_4px_0px_0px_#1A1A1A] text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2">Interview Readiness</div>
                  <div className="text-6xl font-display font-bold text-charcoal mb-6">85%</div>
                  <div className="w-full h-4 bg-cream border-2 border-charcoal rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-charcoal w-[85%]"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="border-2 border-charcoal p-3">
                      <div className="text-[10px] uppercase font-bold text-charcoal/50">Strong Area</div>
                      <div className="font-bold text-sm">System Design</div>
                    </div>
                    <div className="border-2 border-charcoal p-3">
                      <div className="text-[10px] uppercase font-bold text-charcoal/50">Needs Review</div>
                      <div className="font-bold text-sm">Concurrency</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* -------------------- AI IN ACTION -------------------- */}
      <div className="w-full bg-cream border-b-2 border-charcoal py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className='text-4xl md:text-5xl font-display font-bold text-charcoal mb-4'>
              Feedback that actually helps.
            </h2>
            <p className="text-lg text-charcoal/70">
              Stop guessing if your answers are good. See exactly how an interviewer evaluates you.
            </p>
          </div>

          <div className="space-y-6">
            {/* The Question */}
            <div className="bg-white border-2 border-charcoal p-6 shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2">Question</div>
              <h3 className="text-xl font-bold font-display text-charcoal">
                "Tell me about a time you had to optimize a slow database query."
              </h3>
            </div>

            {/* The User Answer */}
            <div className="bg-cream border-2 border-charcoal p-6 ml-0 md:ml-12 border-l-4 border-l-charcoal">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-2">Your Answer Transcript</div>
              <p className="text-charcoal/80 italic">
                "Well, the dashboard was loading slowly, so I checked the database. I added an index to the user table on the email column and it got much faster. The query time went from 5 seconds to like 200 milliseconds."
              </p>
            </div>

            {/* AI Feedback */}
            <div className="bg-charcoal text-cream p-8 ml-0 md:ml-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rotate-45 transform translate-x-10 -translate-y-10"></div>
              
              <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-4">
                <div className="flex items-center gap-2">
                  <LuSparkles className="text-crimson w-5 h-5" />
                  <span className="font-bold uppercase tracking-wider">AI Evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider opacity-60">Score</span>
                  <span className="text-xl font-bold">2/5</span>
                </div>
              </div>

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-widest text-crimson">What you missed</h4>
                  <p className="opacity-80 leading-relaxed">
                    While adding an index is correct, your answer lacks structure (STAR method) and technical depth. You didn't explain <strong className="text-white">how</strong> you identified the bottleneck (e.g., EXPLAIN plan, slow query logs) or the <strong className="text-white">trade-offs</strong> of adding an index (e.g., slower write speeds).
                  </p>
                </div>
                
                <div className="bg-white/10 p-4 border-l-2 border-crimson">
                  <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-widest text-green-400">Pro-Tip for Next Time</h4>
                  <p className="opacity-90 font-mono text-xs">
                    "I used the EXPLAIN ANALYZE command to identify a sequential scan on a table with 5M rows. By creating a composite B-Tree index on (tenant_id, created_at), we bypassed the sequential scan..."
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* -------------------- BENTO BOX FEATURES -------------------- */}
      <div className="w-full bg-white border-b-2 border-charcoal py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-16">
            <h2 className='text-4xl md:text-5xl font-display font-bold text-charcoal mb-4'>
              Everything you need. <br/> Nothing you don't.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px]">
            
            {/* Box 1 (Large) */}
            <div className="col-span-1 md:col-span-2 row-span-2 border-4 border-charcoal bg-cream p-8 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col group">
              <h3 className="text-2xl font-bold font-display mb-2">Role-Specific Decks</h3>
              <p className="text-charcoal/70 mb-8">Select your target engineering role, and our AI instantly generates a hyper-relevant question bank.</p>
              
              <div className="flex-1 bg-white border-2 border-charcoal rounded-sm relative overflow-hidden flex flex-col">
                
                {/* Window Header */}
                <div className="h-8 border-b-2 border-charcoal bg-cream/50 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full border border-charcoal bg-charcoal/20"></div>
                  <div className="w-2 h-2 rounded-full border border-charcoal bg-charcoal/20"></div>
                  <div className="w-2 h-2 rounded-full border border-charcoal bg-charcoal/20"></div>
                </div>

                {/* Canvas Area */}
                <div 
                  className="flex-1 p-5 space-y-4"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(26,26,26,0.1) 1px, transparent 0)', backgroundSize: '12px 12px' }}
                >
                  
                  {/* Panel 1 */}
                  <div className="bg-white border-2 border-charcoal p-3 shadow-[4px_4px_0px_0px_#1A1A1A] group-hover:-translate-y-0.5 transition-transform">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">Target Role</div>
                    <div className="bg-cream border-2 border-charcoal flex items-center justify-between px-3 py-2 cursor-pointer">
                      <span className="text-sm font-bold text-charcoal">Frontend Engineer</span>
                      <LuChevronDown className="w-4 h-4 text-charcoal/50" />
                    </div>
                  </div>
                  
                  {/* Panel 2 */}
                  <div className="bg-white border-2 border-charcoal p-3 shadow-[4px_4px_0px_0px_#1A1A1A] group-hover:-translate-y-0.5 transition-transform delay-75">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">Extracted Topics</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-charcoal text-cream text-[10px] font-bold uppercase">React</span>
                      <span className="px-2 py-1 bg-charcoal text-cream text-[10px] font-bold uppercase">DOM Manipulation</span>
                      <span className="px-2 py-1 bg-charcoal text-cream text-[10px] font-bold uppercase">Web Vitals</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Box 2 (Small) */}
            <div className="col-span-1 md:col-span-2 row-span-1 border-4 border-charcoal bg-white p-8 flex items-center gap-8 justify-between hover:bg-cream transition-colors">
              <div>
                <h3 className="text-xl font-bold font-display mb-2">Spaced Repetition</h3>
                <p className="text-sm text-charcoal/70">Focus on your weakest answers. We schedule reviews right before you forget them.</p>
              </div>
              <div className="w-24 h-24 shrink-0 relative">
                <div className="absolute bottom-0 left-0 w-4 h-8 bg-charcoal"></div>
                <div className="absolute bottom-0 left-6 w-4 h-16 bg-charcoal/80"></div>
                <div className="absolute bottom-0 left-12 w-4 h-12 bg-charcoal/60"></div>
                <div className="absolute bottom-0 left-18 w-4 h-24 bg-crimson"></div>
              </div>
            </div>

            {/* Box 3 (Small) */}
            <div className="col-span-1 md:col-span-2 row-span-1 border-4 border-charcoal bg-charcoal text-cream p-8 flex flex-col justify-center relative overflow-hidden group">
              <LuTarget className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-bold font-display mb-2 relative z-10">Real-time Critiques</h3>
              <p className="text-sm text-cream/70 relative z-10">Don't wait. Get immediate feedback on tone, clarity, and technical accuracy the moment you finish speaking.</p>
            </div>

          </div>
        </div>
      </div>

      {/* -------------------- GAME CONSOLE FAQ -------------------- */}
      <div className="w-full bg-cream py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="text-center mb-16">
            <h2 className='text-4xl md:text-5xl font-display font-bold text-charcoal mb-4'>
              Frequently Asked Questions
            </h2>
          </div>

          {/* Console Chassis */}
          <div className="bg-cream border-4 border-charcoal rounded-[2rem] p-6 md:p-10 shadow-[12px_12px_0px_0px_#1A1A1A] relative">
            
            {/* Screen Area */}
            <div className="bg-charcoal border-4 border-charcoal rounded-xl h-[340px] shadow-inner mb-10 overflow-hidden relative flex flex-col">
              {/* Static Screen Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
              
              {/* Scrollable Inner Display */}
              <div className="flex-1 overflow-y-auto p-6 relative z-10">
                <div className="text-cream font-mono text-xs mb-6 opacity-70 flex items-center">
                  <span className="w-2 h-2 bg-crimson rounded-full animate-pulse mr-2"></span> 
                  _ DIR: /FAQ/GENERAL
                </div>

                <div className="space-y-4 pb-4">
                {FAQ_DATA.map((faq, index) => (
                  <div key={index} className="border border-cream/20 rounded-sm overflow-hidden bg-charcoal/50">
                    <button 
                      onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-cream/5 transition-colors cursor-pointer"
                    >
                      <span className="font-mono text-sm text-cream font-bold pr-4">
                        <span className="text-crimson mr-2">{">"}</span> 
                        {faq.question}
                      </span>
                      <LuChevronDown className={`w-4 h-4 text-cream shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-4 pt-0 text-cream/70 font-mono text-xs leading-relaxed border-t border-cream/10 mt-2">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Controls Area */}
            <div className="flex justify-between items-end px-4">
              
              {/* D-Pad */}
              <div className="relative w-24 h-24">
                <div className="absolute top-8 left-0 w-24 h-8 bg-charcoal rounded-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]"></div>
                <div className="absolute top-0 left-8 w-8 h-24 bg-charcoal rounded-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]"></div>
                {/* Center indent */}
                <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-cream/10 z-10"></div>
              </div>

              {/* A/B Buttons */}
              <div className="flex gap-4 transform -rotate-12">
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={() => setOpenFaq(prev => prev > 0 ? prev - 1 : FAQ_DATA.length - 1)}
                    className="w-12 h-12 rounded-full bg-charcoal border-b-4 border-r-4 border-[#0a0a0a] shadow-sm active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 transition-all cursor-pointer flex items-center justify-center text-cream font-bold font-display"
                  >
                    B
                  </button>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest">Prev</span>
                </div>
                <div className="flex flex-col items-center gap-2 mt-6">
                  <button 
                    onClick={() => setOpenFaq(prev => prev < FAQ_DATA.length - 1 ? prev + 1 : 0)}
                    className="w-12 h-12 rounded-full bg-crimson border-b-4 border-r-4 border-red-900 shadow-sm active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 transition-all cursor-pointer flex items-center justify-center text-cream font-bold font-display"
                  >
                    A
                  </button>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest">Next</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* -------------------- FOOTER CTA -------------------- */}
      <div className='w-full bg-cream py-32'>
        <div className='container mx-auto px-4'>
          <div className="max-w-4xl mx-auto bg-cream text-charcoal rounded-[2rem] p-8 md:p-12 border-4 border-charcoal shadow-[12px_12px_0px_0px_#1A1A1A]">
            
            {/* Top section */}
            <div className="flex items-start gap-5 mb-12">
              <div className="w-12 h-12 rounded-lg border-2 border-charcoal/20 flex items-center justify-center shrink-0 bg-charcoal/5">
                <span className="text-charcoal font-bold">✓</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-charcoal/50 mb-1">System Ready</div>
                <h2 className='text-3xl md:text-4xl font-display font-bold text-charcoal'>
                  Stop memorizing. <br className="hidden md:block" /> Start understanding.
                </h2>
              </div>
            </div>

            {/* Checkmarks row */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm text-charcoal/80 font-mono mb-12">
              <div className="flex items-center gap-2">
                <span className="text-charcoal font-bold">✓</span> Role-specific decks
              </div>
              <div className="flex items-center gap-2">
                <span className="text-charcoal font-bold">✓</span> Real-time AI critiques
              </div>
              <div className="flex items-center gap-2">
                <span className="text-charcoal font-bold">✓</span> Spaced repetition
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-charcoal/10 mb-10"></div>

            {/* Bottom section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="font-bold text-charcoal mb-1 text-lg">Ready to begin interview</div>
                <div className="text-sm text-charcoal/70 max-w-md">Join the developers preparing for their next big role with an AI coach that actually understands software engineering.</div>
              </div>
              <button
                className='shrink-0 bg-charcoal text-cream text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.2)] transition-all cursor-pointer flex items-center gap-3 group'
                onClick={handleCTA}
              >
                Create Free Account
                <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* -------------------- FOOTER -------------------- */}
      <footer className='bg-charcoal text-cream py-16 border-t-2 border-charcoal'>
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between gap-12">
          <div className="md:w-1/3">
            <div className='text-xl font-display font-bold mb-4 flex items-center gap-2'>
              <div className="w-6 h-6 bg-cream rounded-sm flex items-center justify-center">
                <span className="text-charcoal text-xs font-bold">IP</span>
              </div>
              Interview Prep AI
            </div>
            <p className="text-sm text-cream/60 leading-relaxed">
              The intelligent platform for software engineers to practice, refine, and master technical interviews.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-xs mb-6 text-cream/50">Product</h4>
              <ul className="space-y-4 text-sm text-cream/80">
                <li><a href="#" className="hover:text-cream transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cream transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cream transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-xs mb-6 text-cream/50">Legal</h4>
              <ul className="space-y-4 text-sm text-cream/80">
                <li><a href="#" className="hover:text-cream transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cream transition-colors">Terms</a></li>
                <li><a href="https://github.com/Shashank0701-byte/interview-prep" target="_blank" rel="noreferrer" className="hover:text-cream transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader={false}
        title="Welcome"
      >
        <div>
          {currentPage === "login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;