import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Flower2, 
  Sparkles, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Lock, 
  Unlock, 
  XCircle, 
  Trophy, 
  RefreshCw, 
  Mountain
} from 'lucide-react';
import { 
  LEVELS, 
  getLevelQuestions, 
  PASS_THRESHOLD 
} from './data';
import { User, Level, LevelData, Option } from './types';

// --- Components ---

export default function App() {
  const [gameState, setGameState] = useState<'welcome' | 'level-select' | 'game' | 'zen-ending'>('welcome');
  const [user, setUser] = useState<User>({ name: '', totalScore: 0, unlockedLevel: 1 });
  const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);
  
  const renderScreen = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onStart={(name) => {
          setUser(prev => ({ ...prev, name: name || '云游僧' }));
          setGameState('level-select');
        }} />;
      case 'level-select':
        return <LevelSelectScreen 
          user={user} 
          onSelectLevel={(level) => {
            const questions = getLevelQuestions(level.id);
            setCurrentLevelData({
              meta: level,
              questions: questions,
              currentIndex: 0,
              correctCount: 0,
              history: []
            });
            setGameState('game');
          }} 
        />;
      case 'game':
        return currentLevelData ? (
          <GameArena 
            levelData={currentLevelData}
            onExit={() => setGameState('level-select')}
            onLevelComplete={(passed, scoreEarned) => {
              const levelId = currentLevelData.meta.id;
              
              if (passed) {
                setUser(prev => ({
                  ...prev,
                  totalScore: prev.totalScore + scoreEarned,
                  unlockedLevel: Math.max(prev.unlockedLevel, levelId + 1)
                }));
                
                // 终极通关检查
                if (levelId === LEVELS.length) {
                  setGameState('zen-ending');
                  return;
                }
              }
            }}
            onReturnToMenu={() => setGameState('level-select')}
          />
        ) : <div>Loading...</div>;
      case 'zen-ending':
        return <ZenEndingScreen user={user} onReturnToMenu={() => setGameState('level-select')} />;
      default:
        return <div>Unknown State</div>;
    }
  };

  return (
    // Mobile Simulator Container
    <div className="min-h-screen bg-stone-800 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-amber-200">
      <div className="w-full max-w-md bg-stone-50 h-[850px] max-h-[90vh] rounded-[2.5rem] shadow-2xl border-[8px] border-stone-900 overflow-hidden flex flex-col relative ring-4 ring-stone-900/20">
        
        {/* Status Bar Area (Decorative) */}
        <div className="bg-stone-900 h-7 w-full flex items-center justify-center shrink-0 z-50">
           <div className="w-24 h-4 bg-black rounded-b-xl relative -top-1"></div>
        </div>

        {/* App Header */}
        <header className="bg-white border-b border-stone-200 text-stone-800 shrink-0 z-20">
          <div className="px-4 h-14 flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setGameState('welcome')}>
              <Flower2 className="w-5 h-5 text-amber-500" />
              <h1 className="font-serif text-lg tracking-wider font-bold">智慧之辩</h1>
            </div>
            
            <div className="flex items-center space-x-2">
               {gameState !== 'welcome' && (
                  <div className="flex items-center text-xs bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1.5 text-amber-500" />
                    <span className="font-medium text-stone-600">{user.totalScore}</span>
                  </div>
               )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden relative bg-stone-50 scroll-smooth">
           <div className="min-h-full flex flex-col">
            {renderScreen()}
           </div>
        </main>

        {/* Home Indicator (Decorative) */}
        <div className="bg-stone-50 h-7 w-full shrink-0 flex justify-center items-center border-t border-stone-100 pb-1">
          <div className="w-32 h-1.5 bg-stone-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// --- 1. 欢迎界面 ---
interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [name, setName] = useState('');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 animate-in fade-in duration-700">
      <div className="w-full text-center relative">
        {/* Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] text-stone-200/40 font-serif z-0 pointer-events-none select-none">
          悟
        </div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-lg">
            <Brain className="w-12 h-12 text-stone-600" />
          </div>
          
          <h2 className="text-3xl font-serif text-stone-900 mb-3 font-bold tracking-tight">智慧之辩</h2>
          <p className="text-stone-500 mb-8 text-sm leading-relaxed px-4">
            每关五问，全对通过。<br/>
            这不是考试，是对内心的审视。
          </p>

          <div className="space-y-4 w-full">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-stone-200 focus-within:border-amber-500 transition-all">
              <input
                type="text"
                placeholder="输入法号 (选填)"
                className="w-full bg-transparent border-none rounded-lg p-3 text-center text-stone-800 outline-none text-base placeholder:text-stone-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onStart(name)}
              />
            </div>

            <button
              onClick={() => onStart(name)}
              className="w-full bg-stone-900 text-amber-50 py-3.5 rounded-xl font-medium text-base transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-stone-900/20"
            >
              <span>开启试炼</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. 关卡选择 ---
interface LevelSelectScreenProps {
  user: User;
  onSelectLevel: (level: Level) => void;
}

function LevelSelectScreen({ user, onSelectLevel }: LevelSelectScreenProps) {
  return (
    <div className="w-full px-5 py-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-stone-800 mb-1">修行之路</h2>
        <p className="text-xs text-stone-500">当前: <span className="text-amber-600 font-medium">{LEVELS[user.unlockedLevel - 1]?.title.split('：')[1] || '圆满'}</span></p>
      </div>

      <div className="space-y-4">
        {LEVELS.map((level) => {
          const isLocked = level.id > user.unlockedLevel;
          const isPassed = level.id < user.unlockedLevel;
          const isCurrent = level.id === user.unlockedLevel;
          
          return (
            <button 
              key={level.id}
              disabled={isLocked}
              onClick={() => onSelectLevel(level)}
              className={`
                w-full group relative p-5 rounded-2xl text-left transition-all duration-300 flex items-center border
                ${isLocked 
                  ? 'bg-stone-100 border-stone-200 opacity-70 cursor-not-allowed' 
                  : isPassed 
                    ? 'bg-white border-amber-200 shadow-sm'
                    : 'bg-white border-stone-300 shadow-md ring-1 ring-stone-100 border-l-4 border-l-amber-500'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm mr-4 shrink-0
                ${isLocked ? 'bg-stone-200 text-stone-400' : isPassed ? 'bg-green-100 text-green-700' : 'bg-stone-900 text-white'}
              `}>
                {isPassed ? <CheckCircle2 className="w-5 h-5" /> : level.id}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-serif text-base font-bold truncate ${isCurrent ? 'text-stone-900' : 'text-stone-700'}`}>
                    {level.title}
                    </h3>
                    {isPassed && <Unlock className="w-3 h-3 text-green-600 ml-2 shrink-0" />}
                    {isLocked && <Lock className="w-3 h-3 text-stone-400 ml-2 shrink-0" />}
                </div>
                <p className="text-xs text-stone-500 line-clamp-1">
                  {level.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- 3. 游戏主界面 ---
interface GameArenaProps {
  levelData: LevelData;
  onExit: () => void;
  onLevelComplete: (passed: boolean, scoreEarned: number) => void;
  onReturnToMenu: () => void;
}

function GameArena({ levelData, onExit, onLevelComplete, onReturnToMenu }: GameArenaProps) {
  const [currentIdx, setCurrentIdx] = useState(levelData.currentIndex);
  const [answerHistory, setAnswerHistory] = useState<Record<number, Option>>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isLevelFinished, setIsLevelFinished] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentQuestion = levelData.questions[currentIdx];
  const totalQuestions = levelData.questions.length;
  const isLastQuestion = currentIdx === totalQuestions - 1;
  const maxCorrect = currentQuestion.maxCorrect || 1; 

  const currentAnswer = answerHistory[currentIdx];
  const isAnswered = !!currentAnswer;

  const correctCount = Object.values(answerHistory).filter(opt => opt.isCorrect).length;
  const wrongCount = Object.values(answerHistory).filter(opt => !opt.isCorrect).length;
  const canPass = wrongCount === 0;

  const finishLevel = () => {
    setIsLevelFinished(true);
  };

  const handleNavNext = () => {
      setShowFeedbackModal(false);
      if (isLastQuestion) {
        if (Object.keys(answerHistory).length === totalQuestions) {
             finishLevel();
        }
      } else {
        setCurrentIdx(prev => prev + 1);
      }
  };

  const handleNavPrev = () => {
      setShowFeedbackModal(false);
      if (currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
      }
  };

  const handleOptionClick = (option: Option) => {
    if (isAnswered) return; 
    
    setAnswerHistory(prev => ({
        ...prev,
        [currentIdx]: option
    }));
    
    setShowFeedbackModal(true);
    
    if (option.isCorrect) {
      timerRef.current = setTimeout(() => {
         setShowFeedbackModal(prev => {
             if (prev) {
                if (isLastQuestion) {
                    finishLevel();
                } else {
                    setCurrentIdx(i => i + 1);
                    return false; 
                }
             }
             return prev;
         });
      }, 1200); 
    }
  };

  if (isLevelFinished) {
    const passed = correctCount >= PASS_THRESHOLD;
    const score = correctCount * 10; 
    
    return (
      <LevelResultView 
        passed={passed}
        correctCount={correctCount}
        total={totalQuestions}
        levelTitle={levelData.meta.title}
        onContinue={() => {
            onLevelComplete(passed, score);
            onReturnToMenu();
        }}
        onRetry={() => {
            if(timerRef.current) clearTimeout(timerRef.current);
            onReturnToMenu(); 
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-stone-50">
      {/* Progress Header */}
      <div className="bg-white px-5 py-3 border-b border-stone-100 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <button onClick={onExit} className="text-stone-400 p-1 -ml-2 hover:text-stone-800">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-serif text-stone-800 font-bold text-sm">{levelData.meta.title}</span>
            <div className="flex items-center space-x-1 mt-0.5">
               {Array.from({length: totalQuestions}).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentIdx ? 'bg-amber-500 scale-125' : 
                        i < currentIdx ? (answerHistory[i]?.isCorrect ? 'bg-green-400' : 'bg-red-300') : 'bg-stone-200'
                    }`}
                  />
               ))}
            </div>
          </div>
          <div className="w-6 flex justify-end">
            {!canPass && <span className="text-[10px] text-red-400 font-bold">破戒</span>}
          </div> 
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col pb-8">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-16 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none opacity-50"></div>
           
           <span className="relative z-10 text-amber-600/80 font-serif text-xs tracking-widest mb-2 block font-bold">
             问题 {currentIdx + 1}
           </span>
           <h3 className="relative z-10 font-serif text-xl font-bold leading-snug text-stone-800">
            {currentQuestion.q}
           </h3>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, index) => {
              let containerClass = "bg-white border-stone-200 active:bg-stone-50 active:scale-[0.98]";
              let textClass = "text-stone-700";
              let icon: React.ReactNode = String.fromCharCode(65 + index);
              let iconClass = "bg-stone-50 border-stone-300 text-stone-400";

              if (isAnswered) {
                if (currentAnswer === option) {
                  if (option.isCorrect) {
                    containerClass = "bg-green-50 border-green-500 ring-1 ring-green-500";
                    textClass = "text-green-900 font-medium";
                    iconClass = "bg-green-500 border-green-500 text-white";
                    icon = <CheckCircle2 className="w-3 h-3" />;
                  } else {
                    containerClass = "bg-red-50 border-red-400 ring-1 ring-red-400";
                    textClass = "text-red-900";
                    iconClass = "bg-red-400 border-red-400 text-white";
                    icon = <XCircle className="w-3 h-3" />;
                  }
                } else if (option.isCorrect) {
                  containerClass = "bg-green-50/50 border-green-200 border-dashed opacity-70";
                  textClass = "text-green-800";
                  iconClass = "bg-green-100 text-green-600 border-green-200";
                } else {
                  containerClass = "opacity-40 grayscale border-stone-100";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start shadow-sm
                    ${containerClass}
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full border flex items-center justify-center mr-3 text-[10px] font-bold flex-shrink-0 mt-0.5
                    ${iconClass}
                  `}>
                    {icon}
                  </div>
                  <span className={`text-sm leading-relaxed ${textClass}`}>{option.text}</span>
                </button>
              );
            })}
        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
             <div className={`rounded-xl p-4 border ${currentAnswer.isCorrect ? 'bg-green-50 border-green-100' : 'bg-stone-100 border-stone-200'}`}>
                 <h4 className={`font-serif font-bold text-sm mb-1 flex items-center ${currentAnswer.isCorrect ? 'text-green-800' : 'text-stone-700'}`}>
                    {currentAnswer.isCorrect ? '回答正确' : '禅机解析'}
                 </h4>
                 <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {currentAnswer.feedback}
                 </p>
             </div>
             
             <div className="flex space-x-3 mt-4">
                <button 
                    onClick={handleNavPrev}
                    disabled={currentIdx === 0}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border border-stone-200 ${currentIdx === 0 ? 'opacity-0' : 'text-stone-500'}`}
                >
                    上一题
                </button>
                <button 
                    onClick={handleNavNext}
                    className="flex-[2] bg-stone-900 text-white py-3 rounded-xl text-sm font-medium shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                >
                    <span>{isLastQuestion ? "查看结果" : "下一题"}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 4. 关卡小结界面 ---
interface LevelResultViewProps {
  passed: boolean;
  correctCount: number;
  total: number;
  levelTitle: string;
  onContinue: () => void;
  onRetry: () => void;
}

function LevelResultView({ passed, correctCount, total, levelTitle, onContinue, onRetry }: LevelResultViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300 bg-white">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${passed ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
        {passed ? <Trophy className="w-10 h-10" /> : <RefreshCw className="w-10 h-10" />}
      </div>
      
      <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
        {passed ? "圆满过关" : "修行未满"}
      </h2>
      
      <div className="flex items-baseline justify-center space-x-1 mb-6">
         <span className="text-5xl font-bold text-stone-900 font-serif">{correctCount}</span>
         <span className="text-xl text-stone-400 font-serif">/ {total}</span>
      </div>
      
      <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 w-full mb-8 text-center">
        <p className="text-stone-600 text-sm leading-relaxed">
            {passed 
            ? "善哉！心如明镜，不染尘埃。施主智慧已显。" 
            : `需答对 ${PASS_THRESHOLD} 题方可通关。心若浮躁，智慧难生。`
            }
        </p>
      </div>

      <div className="space-y-3 w-full">
        {passed ? (
          <button onClick={onContinue} className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95">
            {levelTitle === LEVELS[LEVELS.length - 1].title ? "进入禅寂之境" : "下一关"}
          </button>
        ) : (
          <button onClick={onRetry} className="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 py-3.5 rounded-xl font-bold transition-all active:scale-95">
            重新挑战
          </button>
        )}
      </div>
    </div>
  );
}

// --- 5. 禅寂完结界面 ---
interface ZenEndingScreenProps {
  user: User;
  onReturnToMenu: () => void;
}

function ZenEndingScreen({ user, onReturnToMenu }: ZenEndingScreenProps) {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 20,
            size: Math.random()
        }));
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 text-amber-50 overflow-hidden z-50">
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(110vh) scale(0.5); opacity: 0; }
                    20% { opacity: 0.4; }
                    100% { transform: translateY(-10vh) scale(1); opacity: 0; }
                }
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    background: #fbbf24;
                    pointer-events: none;
                    animation: float-up linear infinite;
                }
            `}</style>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black" />
            
            {particles.map(p => (
                <div 
                    key={p.id} 
                    className="particle"
                    style={{
                        left: `${p.left}%`,
                        width: `${p.size * 3 + 1}px`,
                        height: `${p.size * 3 + 1}px`,
                        opacity: p.size * 0.5 + 0.1,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `-${p.delay}s`
                    }}
                />
            ))}

            <div className="relative z-10 mb-8 flex items-center justify-center">
                 <div className="relative flex items-center justify-center animate-pulse">
                    <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                    <Flower2 className="w-16 h-16 text-amber-100/90 relative z-10" strokeWidth={1} />
                 </div>
            </div>

            <div className="relative z-10 text-center px-6 w-full max-w-sm space-y-8">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                    <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 tracking-widest">
                        圆满
                    </h2>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto mt-4" />
                </div>

                <div className="space-y-2 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
                    <p className="text-lg text-stone-300 font-serif italic">
                        “本来无一物”
                    </p>
                </div>

                <div className="opacity-0 animate-in fade-in zoom-in-95 duration-1000 delay-1000 fill-mode-forwards bg-stone-900/50 backdrop-blur-md p-6 rounded-xl border border-stone-800/50">
                    <div className="text-stone-500 text-[10px] uppercase tracking-[0.2em] mb-1">施主</div>
                    <div className="text-2xl font-serif text-amber-50 mb-4">{user.name}</div>
                    <div className="flex justify-center items-center space-x-4 text-xs border-t border-stone-800 pt-4">
                        <span className="text-stone-400">功德</span>
                        <span className="text-amber-400 font-bold text-lg">{user.totalScore}</span>
                    </div>
                </div>

                <div className="pt-4 opacity-0 animate-in fade-in duration-1000 delay-[2000ms] fill-mode-forwards">
                    <button 
                        onClick={onReturnToMenu}
                        className="px-6 py-2 rounded-full transition-all border border-stone-700 text-stone-400 hover:text-amber-50 hover:border-amber-500/50 flex items-center justify-center mx-auto space-x-2 text-xs"
                    >
                        <Mountain className="w-3 h-3" />
                        <span>回归红尘</span>
                    </button>
                </div>
            </div>
        </div>
    );
}