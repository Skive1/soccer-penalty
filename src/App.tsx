import { useState, useEffect, useRef } from 'react';
import type { Question, Team } from './types';
import { questions } from './data/questions';

function App() {
  const [teams, setTeams] = useState<Team[]>([
    { name: "Đội Xanh", flag: "🟦", score: 0 },
    { name: "Đội Đỏ", flag: "🟥", score: 0 }
  ]);

  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [kickDirection, setKickDirection] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [time, setTime] = useState('90:00');
  const [showCelebration, setShowCelebration] = useState(false);
  const [playerAnimation, setPlayerAnimation] = useState('');
  const MAX_ROUNDS = 5;
  const [weather, setWeather] = useState<'clear'|'rain'|'snow'>('clear');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(50);
  const [sfxVolume, setSfxVolume] = useState<number>(70);
  const [animationLevel, setAnimationLevel] = useState<'low'|'high'>('high');
  const [gameTheme, setGameTheme] = useState<'day'|'night'>('day');
  const [difficulty, setDifficulty] = useState<'easy'|'normal'|'hard'>('normal');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [hideUI, setHideUI] = useState<boolean>(false);
  
  // Audio references
  const backgroundMusicRef = useRef<HTMLAudioElement|null>(null);
  const crowdSoundRef = useRef<HTMLAudioElement|null>(null);

  // Get a random question that hasn't been used yet
  const getRandomQuestion = () => {
    const availableQuestions = questions.filter(q => !usedQuestionIds.includes(q.id));

    if (availableQuestions.length === 0) {
      setUsedQuestionIds([]);
      return questions[Math.floor(Math.random() * questions.length)];
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setUsedQuestionIds(prev => [...prev, randomQuestion.id]);
    return randomQuestion;
  };

  // Initialize the game
  useEffect(() => {
    if (!gameStarted) return;

    setCurrentQuestion(getRandomQuestion());

    // Random weather effect
    const weathers = ['clear', 'rain', 'snow'] as const;
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);

    // Setup timer
    const minutes = Math.floor(Math.random() * 45) + 45;
    const seconds = Math.floor(Math.random() * 60);
    setTime(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);

    // Setup music and sound
    try {
      // Background music
      if (!backgroundMusicRef.current) {
        backgroundMusicRef.current = new Audio('/sounds/background_music.mp3');
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = musicVolume / 100;
      }
      
      // Crowd sound
      if (!crowdSoundRef.current) {
        crowdSoundRef.current = new Audio('/sounds/crowd_ambient.mp3');
        crowdSoundRef.current.loop = true;
        crowdSoundRef.current.volume = (sfxVolume / 100) * 0.5;
      }
      
      // Play sounds
      backgroundMusicRef.current.play().catch(() => {});
      crowdSoundRef.current.play().catch(() => {});

    // 3D audio context setup
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.listener) {
          if (audioContext.listener.positionX) {
            audioContext.listener.positionX.value = 0;
            audioContext.listener.positionY.value = 0;
            audioContext.listener.positionZ.value = 0;
          } else if (typeof audioContext.listener.setPosition === 'function') {
            audioContext.listener.setPosition(0, 0, 0);
          }
        }
      }
    } catch (error) {
      console.log('Web Audio API not supported');
    }

    return () => {
      // Cleanup audio on unmount
      backgroundMusicRef.current?.pause();
      crowdSoundRef.current?.pause();
    };
  }, [gameStarted]);

  // Update audio volumes when they change
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume / 100;
    }
    if (crowdSoundRef.current) {
      crowdSoundRef.current.volume = (sfxVolume / 100) * 0.5;
    }
  }, [musicVolume, sfxVolume]);

  // Update score when correct answer
  useEffect(() => {
    if (showResult && isCorrect) {
      setTeams(prevTeams => {
        const newTeams = [...prevTeams];
        newTeams[currentTeamIndex] = {
          ...newTeams[currentTeamIndex],
          score: newTeams[currentTeamIndex].score + 1
        };
        return newTeams;
      });
    }
  }, [showResult, isCorrect]);

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return;

    setSelectedOption(optionIndex);
    setShowResult(true);

    const isAnswerCorrect = optionIndex === currentQuestion?.correctAnswer;
    setIsCorrect(isAnswerCorrect);

    const directions = ['left', 'center', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setKickDirection(randomDirection);

    // Player animation
    setPlayerAnimation('animate-player-kick');

    // Delayed ball animation
    setTimeout(() => {
      if (isAnswerCorrect) {
        // Play goal sound
        const goalSound = new Audio('/sounds/goal.mp3');
        goalSound.volume = (sfxVolume / 100) * 0.7;
        goalSound.play().catch(() => {});

        // Show celebration
        setShowCelebration(true);
      } else {
        // Play save sound
        const saveSound = new Audio('/sounds/save.mp3');
        saveSound.volume = (sfxVolume / 100) * 0.7;
        saveSound.play().catch(() => {});
      }
    }, 800);

    setTimeout(() => {
      setShowNextButton(true);
    }, 2000);
  };

  // Handle next turn
  const handleNextTurn = () => {
    // Reset animations
    setPlayerAnimation('');
    setShowCelebration(false);

    if (roundNumber === MAX_ROUNDS && currentTeamIndex === 1) {
      setGameOver(true);
      return;
    }

    const nextTeamIndex = (currentTeamIndex + 1) % 2;
    setCurrentTeamIndex(nextTeamIndex);

    if (nextTeamIndex === 0) {
      setRoundNumber(prev => prev + 1);
      // Add more time to the clock
      const [mins, secs] = time.split(':').map(Number);
      let newMins = mins;
      let newSecs = secs + Math.floor(Math.random() * 3) + 1;
      if (newSecs >= 60) {
        newMins += 1;
        newSecs -= 60;
      }
      setTime(`${newMins}:${newSecs < 10 ? '0' + newSecs : newSecs}`);
    }

    setSelectedOption(null);
    setShowResult(false);
    setKickDirection('');
    setShowNextButton(false);
    setCurrentQuestion(getRandomQuestion());
  };

  // Reset the game
  const resetGame = () => {
    setTeams([
      { name: "Đội Xanh", flag: "🟦", score: 0 },
      { name: "Đội Đỏ", flag: "🟥", score: 0 }
    ]);
    setCurrentTeamIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setKickDirection('');
    setGameOver(false);
    setUsedQuestionIds([]);
    setShowNextButton(false);
    setRoundNumber(1);
    setCurrentQuestion(getRandomQuestion());
    setPlayerAnimation('');
    setShowCelebration(false);
    setGameStarted(true);

    // Reset timer
    const minutes = Math.floor(Math.random() * 45) + 45;
    const seconds = Math.floor(Math.random() * 60);
    setTime(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    
    // Random weather for new game
    const weathers = ['clear', 'rain', 'snow'] as const;
    setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
  };

  // Toggle settings menu
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Toggle tutorial
  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };
  
  // Toggle UI visibility
  const toggleUI = () => {
    setHideUI(!hideUI);
  };

  return (
    <div 
      className={`font-sans min-h-screen p-4 relative transition-all duration-700 ${gameTheme === 'night' ? 'bg-gray-900' : ''}`}
      style={{
        backgroundImage: `url("/images/${gameTheme === 'night' ? 'night_stadium_background.png' : 'stadium_background.png'}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${gameTheme === 'night' ? 'bg-gradient-to-b from-gray-900/95 to-gray-800/90' : 'bg-gradient-to-b from-gray-900/80 to-gray-800/80'} z-0`}></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] relative overflow-hidden">
            {/* Main Menu Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-purple-900/60 backdrop-blur-md"></div>
            
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/20"
                  style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                    boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() * 3 + 1}px rgba(255,255,255,0.${Math.floor(Math.random() * 5) + 3})`
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>

            {/* Soccer ball animation */}
            <div className="absolute w-32 h-32 animate-bounce-slow">
              <img src="/images/ball.png" alt="Soccer Ball" className="w-full h-full object-contain drop-shadow-lg" />
            </div>

            {/* Game logo */}
            <div className="relative z-10 mt-32 mb-10">
              <h1 className="text-6xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">PENALTY</h1>
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">MASTER</h2>
              <div className="absolute -top-14 right-0 text-5xl animate-bounce-slow">⚽</div>
            </div>

            {/* Menu container */}
            <div className="bg-gradient-to-b from-blue-900/90 to-blue-800/90 p-10 rounded-xl shadow-[0_5px_40px_rgba(0,100,255,0.3)] text-center z-10 border-2 border-blue-500/30 backdrop-blur-sm w-80 md:w-96">
              <p className="text-xl text-blue-200 mb-8">Trả lời câu hỏi đúng để ghi bàn!</p>

              {showSettings ? (
                <div className="settings-menu animate-fadeIn">
                  <h3 className="text-2xl font-bold text-white mb-4">Cài Đặt</h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Game theme */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Thời Gian</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setGameTheme('day')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${gameTheme === 'day' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Ngày
                        </button>
                        <button 
                          onClick={() => setGameTheme('night')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${gameTheme === 'night' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Đêm
                        </button>
                      </div>
                    </div>
                    
                    {/* Music volume */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Nhạc Nền: {musicVolume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    {/* SFX volume */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Âm Thanh: {sfxVolume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sfxVolume}
                        onChange={(e) => setSfxVolume(Number(e.target.value))}
                        className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>
                    
                    {/* Animation level */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Hiệu Ứng</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAnimationLevel('low')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${animationLevel === 'low' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Thấp
                        </button>
                        <button 
                          onClick={() => setAnimationLevel('high')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${animationLevel === 'high' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Cao
                        </button>
                      </div>
                    </div>
                    
                    {/* Difficulty */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Độ Khó</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setDifficulty('easy')}
                          className={`flex-1 py-2 px-3 rounded-md transition ${difficulty === 'easy' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Dễ
                        </button>
                        <button 
                          onClick={() => setDifficulty('normal')}
                          className={`flex-1 py-2 px-3 rounded-md transition ${difficulty === 'normal' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Thường
                        </button>
                        <button 
                          onClick={() => setDifficulty('hard')}
                          className={`flex-1 py-2 px-3 rounded-md transition ${difficulty === 'hard' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Khó
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleSettings}
                    className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all text-lg font-bold shadow-lg"
                  >
                    Quay Lại
                  </button>
                </div>
              ) : showTutorial ? (
                <div className="tutorial-menu animate-fadeIn">
                  <h3 className="text-2xl font-bold text-white mb-4">Hướng Dẫn</h3>
                  
                  <div className="text-left text-blue-100 space-y-3 text-sm">
                    <p>1. Trò chơi gồm 5 vòng sút penalty</p>
                    <p>2. Mỗi đội được sút 1 lần trong mỗi vòng</p>
                    <p>3. Trả lời đúng câu hỏi để ghi bàn</p>
                    <p>4. Đội nào ghi nhiều bàn hơn sẽ thắng</p>
                    <p>5. Có thể gỡ hoặc thắng ở phút bù giờ!</p>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <div className="relative w-16 h-16 animate-bounce-slow">
                      <img src="/images/ball.png" alt="Soccer Ball" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleTutorial}
                    className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all text-lg font-bold shadow-lg"
                  >
                    Quay Lại
                  </button>
                </div>
              ) : (
                <div className="menu-buttons space-y-4 animate-fadeIn">
              <button
                onClick={() => setGameStarted(true)}
                    className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-300 text-gray-900 rounded-full text-xl font-bold hover:from-yellow-400 hover:to-yellow-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Bắt Đầu Chơi
              </button>
                  
                  <button
                    onClick={toggleSettings}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full text-xl font-bold hover:from-blue-500 hover:to-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Cài Đặt
                  </button>
                  
                  <button
                    onClick={toggleTutorial}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full text-xl font-bold hover:from-green-500 hover:to-green-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Hướng Dẫn
                  </button>
                </div>
              )}
            </div>

            {/* Version and credits */}
            <div className="mt-4 text-gray-400 text-xs">
              <p>Penalty Master v1.0 © 2023</p>
            </div>
          </div>
        ) : (
          <>
            {/* Game UI */}
            {!hideUI && (
              <>
                {/* Header with logo and score */}
            <div className="text-center mb-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600 animate-pulse opacity-10 rounded-lg"></div>
                  <h1 className="text-4xl font-bold py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white border-dashed border-2 border-white/30 rounded-lg relative z-10 shadow-lg">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 animate-bounce-slow">⚽</span>
                    PENALTY MASTER
                <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-bounce-slow delay-300">⚽</span>
              </h1>
              <div className="text-lg font-bold mb-2 text-blue-100 mt-2 animate-pulse">
                Vòng {roundNumber}/{MAX_ROUNDS} - Lượt của <span className={`${currentTeamIndex === 0 ? 'text-blue-300' : 'text-red-300'} font-bold`}>
                  {teams[currentTeamIndex].name}
                </span>
              </div>
            </div>

                {/* Enhanced scoreboard with team logos and player icons */}
                <div className="flex justify-between items-center mb-5 bg-gradient-to-b from-blue-900/80 to-blue-800/80 p-4 rounded-lg text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/scoreboard_texture.png')] opacity-10"></div>
                  
                  {/* Team 1 details */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-2xl shadow-lg border-2 border-blue-400/30">
                      {teams[0].flag}
                    </div>
                    <div>
                <span className="font-bold text-lg uppercase text-blue-100">{teams[0].name}</span>
                      <div className="flex mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`w-3 h-3 rounded-full mx-0.5 ${i < teams[0].score ? 'bg-green-400' : i < roundNumber ? 'bg-red-400' : 'bg-gray-600'}`}></span>
                        ))}
              </div>
                    </div>
                  </div>
                  
                  {/* Score display */}
                  <div className="text-3xl font-bold relative z-10 bg-gradient-to-b from-blue-900/80 to-blue-700/80 px-8 py-2 rounded-lg backdrop-blur-sm border border-blue-400/30 shadow-[0_0_15px_rgba(0,100,255,0.3)]">
                {teams[0].score} - {teams[1].score}
              </div>
                  
                  {/* Team 2 details */}
                  <div className="flex items-center gap-3 relative z-10 flex-row-reverse">
                    <div className="w-12 h-12 rounded-full bg-red-700 flex items-center justify-center text-2xl shadow-lg border-2 border-red-400/30">
                      {teams[1].flag}
                    </div>
                    <div className="text-right">
                <span className="font-bold text-lg uppercase text-red-100">{teams[1].name}</span>
                      <div className="flex mt-1 justify-end">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`w-3 h-3 rounded-full mx-0.5 ${i < teams[1].score ? 'bg-green-400' : i < roundNumber && currentTeamIndex === 1 ? 'bg-red-400' : 'bg-gray-600'}`}></span>
                        ))}
              </div>
            </div>
                  </div>
                </div>
              </>
            )}

            {/* Move question outside the game field */}
            {/* Question box above the game field */}
            {currentQuestion && (
              <div className="w-full bg-blue-600 text-white font-bold text-center py-3 px-4 rounded-lg mb-4">
                <div className="text-xl">{currentQuestion.text}</div>
              </div>
            )}

            {/* Game field container - separate from question */}
            <div
              className="relative w-full h-[500px] rounded-lg overflow-hidden mb-5 shadow-2xl"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Field base with improved texture */}
              <div
                className="absolute inset-0"
                style={{
                  transform: 'rotateX(5deg)',
                  backgroundImage: 'url("/images/grass_texture.png")',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'repeat',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
                }}
              >
                {/* Dynamic lighting effect */}
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/20 transition-opacity duration-700 ${gameTheme === 'night' ? 'opacity-60' : 'opacity-30'}`}></div>
              </div>

              {/* 3D depth effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>

              {/* Crowd with enhanced animation */}
              <div className="absolute top-0 left-0 right-0 h-12 overflow-hidden">
                <div className={`crowd-pattern h-full animate-crowd-wave border-b-2 border-dashed border-white/50 ${gameTheme === 'night' ? 'brightness-50' : ''}`}></div>
                
                {/* Animated fans */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: animationLevel === 'high' ? 30 : 15 }).map((_, i) => (
                    <div key={i} className="w-6 h-6 mx-[2px] animate-fan-jump" style={{ animationDelay: `${Math.random() * 2}s` }}>
                      <div className={`w-full h-full rounded-full ${i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stadium lights effect */}
              {gameTheme === 'night' && (
                <>
                  <div className="absolute top-0 left-0 w-1/3 h-80 bg-gradient-radial from-white/40 to-transparent opacity-80 blur-lg"></div>
                  <div className="absolute top-0 right-0 w-1/3 h-80 bg-gradient-radial from-white/40 to-transparent opacity-80 blur-lg"></div>
                </>
              )}

              {/* Weather effects - Rain */}
              {weather === 'rain' && animationLevel === 'high' && (
                <div className="absolute inset-0 pointer-events-none z-[8]">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-[1px] h-[20px] bg-blue-200/40"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animation: 'rainDrop 1s linear infinite'
                      }}
                    ></div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/30"></div>
                </div>
              )}
              
              {/* Snow effect */}
              {weather === 'snow' && animationLevel === 'high' && (
                <div className="absolute inset-0 pointer-events-none z-[8]">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-[3px] h-[3px] rounded-full bg-white/80"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animation: 'snowDrop 6s linear infinite'
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Field lines */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/40 z-[1]"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/40 z-[1] bg-white/10"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[400px] h-[200px] border-2 border-white/50 border-t-0 z-[1]">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[180px] h-[60px] border-2 border-white/50 border-b-0 z-[1]"></div>
                <div className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white/50 z-[1]"></div>
                <div className="absolute -bottom-[50px] left-1/2 transform -translate-x-1/2 w-[150px] h-[75px] border-t-2 border-white/50 rounded-t-full z-[1] border-l-2 border-r-2"></div>
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-[2px] bg-white/50 z-[1]"></div>

              {/* Game info with HUD style */}
              {!hideUI && (
                <div className="absolute top-16 left-5 bg-black/80 text-white p-3 rounded z-10 backdrop-blur-sm border border-gray-700 shadow-lg animate-float">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-3xl mb-2 shadow-glow-orange">👤</div>
                  <div className="text-gray-300 font-semibold">Score: <span className="text-white">{teams[0].score + teams[1].score}</span></div>
                  <div className="text-gray-300 font-semibold">Round: <span className="text-white">{roundNumber}/{MAX_ROUNDS}</span></div>
                  {/* Weather icon */}
                  <div className="text-gray-300 font-semibold mt-1">
                    Weather: <span className="text-white">{weather === 'rain' ? '🌧️' : weather === 'snow' ? '❄️' : '☀️'}</span>
                  </div>
                </div>
              )}

              {/* Answer options positioned much lower on the field */}
              {!showResult && currentQuestion && (
                <>
                  {/* Top row - moved much lower */}
                  <div 
                    onClick={() => handleOptionSelect(0)} 
                    className="absolute top-[58%] left-[5%] w-[35%] py-3 px-4 bg-blue-500/80 hover:bg-blue-600/80 cursor-pointer rounded-lg z-20 transition-all transform hover:scale-105 border-2 border-white/30"
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white text-blue-500 font-bold flex items-center justify-center mr-2">A</span>
                      <span className="text-white">{currentQuestion.options[0]}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleOptionSelect(1)} 
                    className="absolute top-[58%] right-[5%] w-[35%] py-3 px-4 bg-blue-500/80 hover:bg-blue-600/80 cursor-pointer rounded-lg z-20 transition-all transform hover:scale-105 border-2 border-white/30"
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white text-blue-500 font-bold flex items-center justify-center mr-2">B</span>
                      <span className="text-white">{currentQuestion.options[1]}</span>
                    </div>
                  </div>

                  {/* Bottom row - moved much lower */}
                  <div 
                    onClick={() => handleOptionSelect(2)} 
                    className="absolute top-[72%] left-[5%] w-[35%] py-3 px-4 bg-blue-500/80 hover:bg-blue-600/80 cursor-pointer rounded-lg z-20 transition-all transform hover:scale-105 border-2 border-white/30"
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white text-blue-500 font-bold flex items-center justify-center mr-2">C</span>
                      <span className="text-white">{currentQuestion.options[2]}</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleOptionSelect(3)} 
                    className="absolute top-[72%] right-[5%] w-[35%] py-3 px-4 bg-blue-500/80 hover:bg-blue-600/80 cursor-pointer rounded-lg z-20 transition-all transform hover:scale-105 border-2 border-white/30"
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-white text-blue-500 font-bold flex items-center justify-center mr-2">D</span>
                      <span className="text-white">{currentQuestion.options[3]}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Result message overlay */}
              {showResult && (
                <div className={`absolute top-0 left-0 right-0 py-4 px-4 ${isCorrect ? 'bg-green-500/80' : 'bg-red-500/80'} text-white font-bold text-center z-20 backdrop-blur-sm`}>
                  <div className="text-xl">
                    {isCorrect 
                      ? <><span className="text-2xl">🎉</span> Đúng rồi! <span className="text-2xl">🎉</span></> 
                      : <><span className="text-2xl">😢</span> Sai rồi! <span className="text-2xl">😢</span></>}
              </div>
                </div>
              )}

              {/* Next button when showing result - positioned higher */}
              {showNextButton && (
                <div className="absolute bottom-20 right-5 z-20">
                  <button
                    onClick={handleNextTurn}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full hover:from-blue-500 hover:to-blue-300 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-1"
                  >
                    {roundNumber === MAX_ROUNDS && currentTeamIndex === 1 
                      ? <>Kết thúc</>
                      : <>Tiếp tục</>}
                  </button>
              </div>
              )}

              {/* Enhanced 3D goal structure */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[160px] z-[3]"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Posts with realistic effect */}
                <div
                  className="absolute top-0 left-0 w-[8px] h-[160px] rounded-sm"
                  style={{
                    background: 'linear-gradient(90deg, #f0f0f0, #ffffff, #e0e0e0)',
                    boxShadow: '2px 0px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                  }}
                ></div>
                <div
                  className="absolute top-0 right-0 w-[8px] h-[160px] rounded-sm"
                  style={{
                    background: 'linear-gradient(270deg, #f0f0f0, #ffffff, #e0e0e0)',
                    boxShadow: '-2px 0px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                  }}
                ></div>
                <div
                  className="absolute top-0 left-0 right-0 h-[8px] rounded-sm"
                  style={{
                    background: 'linear-gradient(0deg, #e0e0e0, #ffffff, #f0f0f0)',
                    boxShadow: '0px 2px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                  }}
                ></div>

                {/* Net with better realistic pattern */}
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(90deg, transparent 47%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,0.8) 52%, transparent 53%),
                      linear-gradient(0deg, transparent 47%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,0.8) 52%, transparent 53%)
                    `,
                    backgroundSize: '15px 15px',
                    opacity: gameTheme === 'night' ? 0.9 : 0.8,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                  }}
                ></div>

                {/* Net shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/20 blur-sm transform-gpu"></div>
              </div>

              {/* Enhanced goalkeeper with better animations */}
              <div
                className="absolute top-[15px] left-1/2 transform -translate-x-1/2 w-[110px] h-[140px] z-[4]"
                style={{
                  transformStyle: 'preserve-3d',
                  animation: showResult ? (
                    !isCorrect ? (
                      kickDirection === 'left' ? 'goalkeeper3DSaveLeft 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                        kickDirection === 'right' ? 'goalkeeper3DSaveRight 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                          'goalkeeper3DSaveCenter 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    ) : (
                      kickDirection === 'left' ? 'goalkeeper3DWrongLeft 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                        kickDirection === 'right' ? 'goalkeeper3DWrongRight 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                          'goalkeeper3DWrongCenter 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    )
                  ) : ''
                }}
              >
                <img
                  src="/images/goalkeeper.png"
                  alt="Goalkeeper"
                  className="w-full h-full object-contain drop-shadow-lg transition-all duration-300 ease-in-out"
                  style={{
                    filter: `drop-shadow(0 10px 8px rgba(0,0,0,0.4)) ${gameTheme === 'night' ? 'brightness(0.8)' : 'brightness(1)'}`,
                    transform: showResult ? 'scale(1.1)' : 'scale(1)',
                    height: '225px',
                  }}
                />

                {/* Dynamic goalkeeper shadow */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 bg-black/30 rounded-full blur-md w-[80px] h-[10px]"
                  style={{
                    bottom: '-10px',
                    transformStyle: 'preserve-3d',
                    animation: showResult ? 'shadowMove 0.7s ease-out forwards' : ''
                  }}
                ></div>
                
                {/* Goalkeeper ready animation */}
                {!showResult && (
                  <div className="absolute inset-0 animate-pulse-slow opacity-70">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full blur-sm"></div>
                  </div>
                )}
              </div>

              {/* Simplified player */}
              <div className={`absolute bottom-[30px] left-[45%] transform -translate-x-1/2 w-[50px] h-[100px] z-[3] ${playerAnimation}`}>
                <div className={`player-container ${teams[currentTeamIndex].name === "Đội Xanh" ? "player-blue" : "player-red"}`}>
                  {/* Simple head */}
                  <div className="player-head">
                    <div className="player-hair"></div>
                    <div className="player-face"></div>
                  </div>

                  {/* Simple body - Team Blue: #10 Messi, Team Red: #7 Ronaldo */}
                  <div className="player-body">
                    <div className="player-number">{currentTeamIndex === 0 ? 10 : 7}</div>
                    <div className="player-name">{currentTeamIndex === 0 ? "SI" : "RÔ"}</div>
                  </div>

                  {/* Simple arms */}
                  <div className="player-arm player-arm-left"></div>
                  <div className="player-arm player-arm-right"></div>

                  {/* Simple legs */}
                  <div className="player-leg player-leg-left">
                    <div className="player-shorts"></div>
                    <div className="player-shoe player-shoe-left"></div>
                  </div>
                  <div className="player-leg player-leg-right">
                    <div className="player-shorts"></div>
                    <div className="player-shoe player-shoe-right"></div>
                  </div>
                </div>

                {/* Player shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[30px] h-[5px] bg-black/20 filter blur-sm rounded-full"></div>
              </div>

              {/* Enhanced ball with better physics */}
              <div
                className={`absolute bottom-[40px] left-1/2 transform -translate-x-1/2 w-[40px] h-[40px] z-[5]`}
                style={{
                  animation: showResult ? (
                    isCorrect ? (
                      kickDirection === 'left' ? 'ballGoalLeft 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                        kickDirection === 'right' ? 'ballGoalRight 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                          'ballGoalCenter 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    ) : (
                      kickDirection === 'left' ? 'ballSaveLeft 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                        kickDirection === 'right' ? 'ballSaveRight 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' :
                          'ballSaveCenter 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                    )
                  ) : ''
                }}
              >
                <img
                  src="/images/ball.png"
                  alt="Soccer Ball"
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.3))',
                    animation: showResult ? 'ballRotate 1.2s linear forwards' : 'ballHover 2s ease-in-out infinite'
                  }}
                />
                
                {/* Ball shadow */}
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[30px] h-[6px] bg-black/30 rounded-full blur-sm"
                  style={{
                    animation: showResult ? 'ballShadowScale 1.2s ease-out forwards' : 'ballShadowHover 2s ease-in-out infinite'
                  }}
                ></div>
              </div>

              {/* Penalty mark with enhanced glow */}
              <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 w-[8px] h-[8px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)] z-[2]"></div>

              {/* Enhanced celebration effects */}
              {showCelebration && animationLevel === 'high' && (
                <div className="absolute inset-0 pointer-events-none z-[10]">
                  {/* More confetti */}
                  {[...Array(80)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 40}%`,
                        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${Math.random() * 2 + 2}s`,
                        transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
                        clipPath: i % 3 === 0 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : i % 3 === 1 ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'circle(50% at 50% 50%)'
                      }}
                    ></div>
                  ))}

                  {/* Goal flash with reduced intensity */}
                  <div className="absolute inset-0 bg-white opacity-30 animate-goal-flash"></div>

                  {/* Enhanced GOAL text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 animate-goal-text tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">GOAL!</div>
                </div>
              )}

              {/* Grass effect when kicking */}
              {showResult && animationLevel === 'high' && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[4]">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-3 bg-green-500"
                      style={{
                        left: `${Math.random() * 60 - 30}px`,
                        transform: `scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg)`,
                        opacity: Math.random() * 0.5 + 0.5,
                        animation: `grassFly 0.8s ease-out forwards ${Math.random() * 0.3}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Dust effect when goalkeeper jumps */}
              {showResult && !isCorrect && animationLevel === 'high' && (
                <div
                  className="absolute z-[3]"
                  style={{
                    top: kickDirection === 'center' ? '150px' : '120px',
                    left: kickDirection === 'left' ? '35%' : kickDirection === 'right' ? '65%' : '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white/30"
                      style={{
                        width: `${Math.random() * 10 + 5}px`,
                        height: `${Math.random() * 10 + 5}px`,
                        left: `${Math.random() * 60 - 30}px`,
                        top: `${Math.random() * 60 - 30}px`,
                        opacity: Math.random() * 0.5 + 0.3,
                        animation: `dust 0.6s ease-out forwards ${Math.random() * 0.2}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}
              
              {/* UI controls */}
              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={toggleUI} 
                  className="w-10 h-10 rounded-full bg-gray-800/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gray-700/70 transition-all border border-white/20"
                  title={hideUI ? "Show UI" : "Hide UI"}
                >
                  {hideUI ? "👁️" : "👁️‍🗨️"}
                </button>
                
                <button 
                  onClick={toggleSettings}
                  className="w-10 h-10 rounded-full bg-gray-800/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gray-700/70 transition-all border border-white/20"
                  title="Settings"
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* Enhanced game over modal */}
            {gameOver && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="max-w-2xl w-full bg-gradient-to-b from-blue-900/90 to-purple-900/90 rounded-2xl p-8 shadow-2xl border-2 border-blue-400/30 backdrop-blur-md relative overflow-hidden animate-scaleIn">
                  {/* Background effects */}
                  <div className="absolute inset-0 bg-[url('/images/confetti_bg.png')] opacity-10 animate-slide"></div>
                  <div className="absolute inset-0 bg-gradient-radial from-transparent to-blue-900/50"></div>
                  
                  {/* Spotlights */}
                  <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-radial from-blue-500/10 to-transparent opacity-70 animate-pulse-slow"></div>

                  {/* Trophy and team info */}
                  <div className="relative z-10 text-center">
                    <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-6 drop-shadow-lg">
                      {teams[0].score > teams[1].score
                        ? "CHIẾN THẮNG!"
                        : teams[1].score > teams[0].score
                          ? "CHIẾN THẮNG!"
                          : "HÒA!"}
                    </h2>

                    {/* Final score with enhanced display */}
                    <div className="flex justify-center items-center gap-8 my-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-4xl mb-2 border-4 border-blue-500/50 shadow-[0_0_15px_rgba(0,100,255,0.5)]">
                          {teams[0].flag}
                        </div>
                        <div className="font-bold text-blue-200">{teams[0].name}</div>
                      </div>

                      <div className="text-5xl font-bold text-white bg-gradient-to-b from-blue-900/70 to-blue-800/70 px-8 py-4 rounded-lg border border-blue-400/30 shadow-[0_0_30px_rgba(0,100,255,0.3)]">
                        {teams[0].score} - {teams[1].score}
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-4xl mb-2 border-4 border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                          {teams[1].flag}
                        </div>
                        <div className="font-bold text-red-200">{teams[1].name}</div>
                      </div>
                    </div>

                    {/* Enhanced winner announcement */}
                    <div className="text-3xl text-white font-bold mb-8">
                      {teams[0].score > teams[1].score
                        ? <>{teams[0].flag} {teams[0].name} chiến thắng!</>
                        : teams[1].score > teams[0].score
                          ? <>{teams[1].flag} {teams[1].name} chiến thắng!</>
                          : 'Trận đấu hòa!'}
                    </div>

                    {/* Trophy animation */}
                    <div className="mx-auto w-32 h-32 mb-8 text-7xl animate-trophy drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]">🏆</div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-3 gap-4 mb-8 text-white">
                      <div className="bg-blue-900/50 rounded p-3 backdrop-blur-sm border border-blue-500/20">
                        <div className="text-3xl font-bold">{roundNumber}</div>
                        <div className="text-sm text-blue-200">Vòng</div>
                      </div>
                      <div className="bg-blue-900/50 rounded p-3 backdrop-blur-sm border border-blue-500/20">
                        <div className="text-3xl font-bold">{teams[0].score + teams[1].score}</div>
                        <div className="text-sm text-blue-200">Bàn thắng</div>
                      </div>
                      <div className="bg-blue-900/50 rounded p-3 backdrop-blur-sm border border-blue-500/20">
                        <div className="text-3xl font-bold">{usedQuestionIds.length}</div>
                        <div className="text-sm text-blue-200">Câu hỏi</div>
                      </div>
                    </div>

                    {/* Enhanced buttons */}
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setGameStarted(false)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full text-lg font-bold hover:from-blue-500 hover:to-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Màn hình chính
                      </button>

                      <button
                        onClick={resetGame}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-300 text-gray-900 rounded-full text-lg font-bold hover:from-yellow-400 hover:to-yellow-200 transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Chơi lại
                      </button>
                    </div>
                  </div>

                  {/* Enhanced fireworks effect */}
                  {teams[0].score !== teams[1].score && animationLevel === 'high' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0 h-0"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 60}%`,
                          }}
                        >
                          <div
                            className="firework"
                            style={{
                              animation: `firework ${Math.random() * 2 + 1}s ease-out forwards ${Math.random() * 3}s`,
                              '--color': `hsl(${Math.random() * 360}, 100%, 50%)`,
                            } as React.CSSProperties}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings modal */}
            {showSettings && !gameOver && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="w-96 bg-gradient-to-b from-blue-900/90 to-blue-800/90 p-6 rounded-xl shadow-2xl border-2 border-blue-400/30 backdrop-blur-md relative overflow-hidden animate-scaleIn">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Cài Đặt</h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Game theme */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Thời Gian</label>
                      <div className="flex gap-2">
                    <button
                          onClick={() => setGameTheme('day')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${gameTheme === 'day' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Ngày
                    </button>
                        <button 
                          onClick={() => setGameTheme('night')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${gameTheme === 'night' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Đêm
                        </button>
                      </div>
                </div>

                    {/* Weather effects */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Thời Tiết</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setWeather('clear')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${weather === 'clear' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          ☀️
                        </button>
                        <button 
                          onClick={() => setWeather('rain')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${weather === 'rain' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          🌧️
                        </button>
                        <button 
                          onClick={() => setWeather('snow')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${weather === 'snow' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          ❄️
                        </button>
                  </div>
                    </div>
                    
                    {/* Music volume */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Nhạc Nền: {musicVolume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    {/* SFX volume */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Âm Thanh: {sfxVolume}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sfxVolume}
                        onChange={(e) => setSfxVolume(Number(e.target.value))}
                        className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>
                    
                    {/* Animation level */}
                    <div className="flex flex-col gap-2">
                      <label className="text-blue-200 text-left text-sm">Hiệu Ứng</label>
                      <div className="flex gap-2">
                    <button
                          onClick={() => setAnimationLevel('low')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${animationLevel === 'low' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Thấp
                        </button>
                        <button 
                          onClick={() => setAnimationLevel('high')}
                          className={`flex-1 py-2 px-4 rounded-md transition ${animationLevel === 'high' ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-blue-700 text-blue-200'}`}
                        >
                          Cao
                    </button>
                  </div>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={toggleSettings}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all text-lg font-bold shadow-lg"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced questions and answers */}
            {/* !gameOver && !hideUI && (
              <div className="bg-gradient-to-b from-gray-900/90 to-gray-800/90 p-6 rounded-lg shadow-2xl border border-blue-900/50 backdrop-blur-sm">
                {/* Question with enhanced styling */}
                {/* <div className="text-2xl mb-6 text-center font-bold bg-gradient-to-r from-blue-200 to-blue-100 text-transparent bg-clip-text animate-pulse-slow px-4 py-2">{currentQuestion?.text}</div> */}
                
                {/* Options grid with better styling */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                  {/* {currentQuestion?.options.map((option, index) => ( */}
                    {/* <button */}
                      {/* key={index} */}
                      {/* onClick={() => handleOptionSelect(index)} */}
                      {/* disabled={showResult} */}
                      {/* className={`p-5 rounded-lg text-base transition-all transform hover:scale-105 shadow-lg 
                        ${showResult && index === currentQuestion.correctAnswer 
                          ? 'bg-gradient-to-r from-green-600 to-green-400 text-white border-l-8 border-green-800' 
                          : showResult && selectedOption === index && selectedOption !== currentQuestion.correctAnswer 
                            ? 'bg-gradient-to-r from-red-600 to-red-400 text-white border-l-8 border-red-800' 
                            : selectedOption === index 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white border-l-8 border-blue-800' 
                              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 hover:from-blue-700 hover:to-blue-500 hover:text-white border-l-4 border-gray-600 hover:border-blue-600'
                        }`} */}
                    {/* > */}
                      {/* <div className="flex items-center"> */}
                        {/* <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 font-bold text-lg shadow-inner">{['A', 'B', 'C', 'D'][index]}</span> */}
                        {/* <span>{option}</span> */}
                      {/* </div> */}
                    {/* </button> */}
                  {/* ))} */}
                {/* </div> */}

                {/* Result message with enhanced styling */}
                {/* {showResult && ( */}
                  {/* <div className={`text-2xl font-bold text-center my-5 p-4 rounded-lg backdrop-blur-sm ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'} animate-bounce-slow shadow-lg border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}> */}
                    {/* {isCorrect  */}
                      {/* ? <><span className="text-3xl">🎉</span> GOOOOAL! Bạn đã trả lời đúng! <span className="text-3xl">🎉</span></>  */}
                      {/* : <><span className="text-3xl">😢</span> Thủ môn đã cản phá! Bạn trả lời sai rồi! <span className="text-3xl">😢</span></>} */}
                  {/* </div> */}
                {/* )} */}

                {/* Next button with enhanced styling */}
                {/* {showNextButton && ( */}
                  {/* <div className="flex justify-end mt-8 pr-4"> */}
                    {/* <button */}
                      {/* onClick={handleNextTurn} */}
                      {/* className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full hover:from-blue-500 hover:to-blue-300 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-2" */}
                    {/* > */}
                      {/* {roundNumber === MAX_ROUNDS && currentTeamIndex === 1  */}
                        {/* ? <>Kết thúc trận đấu <span className="text-xl">🏁</span></> */}
                        {/* : <>Lượt tiếp theo <span className="text-xl">➜</span></>} */}
                    {/* </button> */}
                  {/* </div> */}
                {/* )} */}
              {/* </div> */}
            {/* ) */}
            {/* } */}

            {/* Firework particles for game over */}
            {gameOver && teams[0].score !== teams[1].score && animationLevel === 'high' && (
              <div className="fixed inset-0 pointer-events-none z-[100]">
                {Array.from({ length: 150 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${Math.random() * 10 + 2}px`,
                      height: `${Math.random() * 10 + 2}px`,
                      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                      animation: `fireworkParticle ${Math.random() * 3 + 2}s ease-out forwards ${Math.random() * 2}s`,
                      transform: `scale(${Math.random() * 0.8 + 0.2})`,
                      boxShadow: `0 0 ${Math.random() * 5 + 2}px ${Math.random() * 3 + 1}px rgba(255,255,255,0.${Math.floor(Math.random() * 5) + 3})`
                    } as React.CSSProperties}
                  ></div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;