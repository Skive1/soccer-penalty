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
  const weather = Math.random() > 0.7 ? 'rain' : Math.random() > 0.5 ? 'sunny' : 'night';
  const [gameStarted, setGameStarted] = useState<boolean>(false);

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
    
    // Setup timer
    const minutes = Math.floor(Math.random() * 45) + 45;
    const seconds = Math.floor(Math.random() * 60);
    setTime(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    
    // Add crowd sound effect on start
    const audio = new Audio('/sounds/crowd_ambient.mp3');
    audio.volume = 0.2;
    audio.loop = true;
    audio.play().catch(() => {});
    
    // Ambient sound
    const ambientSound = new Audio('/sounds/stadium_ambient.mp3');
    ambientSound.volume = 0.2;
    ambientSound.loop = true;
    ambientSound.play().catch(() => {});
    
    // 3D audio context setup
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.listener) {
          // Thiết lập không gian âm thanh 3D
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
      audio.pause();
      audio.currentTime = 0;
    };
  }, [gameStarted]);

  // Thêm useEffect riêng để xử lý cập nhật điểm
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
  }, [showResult, isCorrect]); // Chỉ chạy khi showResult hoặc isCorrect thay đổi

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
    
    // Player animation - đá bóng
    setPlayerAnimation('animate-player-kick');
    
    // Delayed ball animation
    setTimeout(() => {
      if (isAnswerCorrect) {
        // Phát âm thanh ghi bàn
        const goalSound = new Audio('/sounds/goal.mp3');
        goalSound.volume = 0.5;
        goalSound.play().catch(() => {});
        
        // Tạo hiệu ứng ăn mừng
        setShowCelebration(true);
      } else {
        // Phát âm thanh thủ môn cứu thua
        const saveSound = new Audio('/sounds/save.mp3');
        saveSound.volume = 0.5;
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
    setGameStarted(true); // Đảm bảo trò chơi bắt đầu lại
    
    // Reset timer
    const minutes = Math.floor(Math.random() * 45) + 45;
    const seconds = Math.floor(Math.random() * 60);
    setTime(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
  };

  return (
    <div className="max-w-4xl mx-auto font-sans bg-gradient-to-b from-gray-900 to-gray-800 p-4 min-h-screen">
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900 opacity-40"></div>
          
          {/* Soccer ball animation */}
          <div className="absolute w-32 h-32 animate-bounce-slow">
            <img src="/images/ball.png" alt="Soccer Ball" className="w-full h-full object-contain" />
          </div>
          
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 p-10 rounded-xl shadow-2xl text-center z-10 mt-32 border-2 border-blue-500">
            <h1 className="text-5xl font-bold mb-6 text-white">⚽ Trò Chơi Sút Penalty</h1>
            <p className="text-xl text-blue-200 mb-8">Trả lời câu hỏi đúng để ghi bàn!</p>
            
            <button 
              onClick={() => setGameStarted(true)}
              className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-300 text-gray-900 rounded-full text-2xl font-bold hover:from-yellow-400 hover:to-yellow-200 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Bắt Đầu Chơi
            </button>
          </div>
          
          {/* Animated background particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      ) : (
        <>
          <div className="text-center mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 animate-pulse opacity-10"></div>
            <h1 className="text-4xl font-bold py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white border-dashed border-2 border-white rounded relative z-10 shadow-lg">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 animate-bounce-slow">⚽</span> 
              Trò Chơi Sút Penalty 
              <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-bounce-slow delay-300">⚽</span>
            </h1>
            <div className="text-lg font-bold mb-2 text-blue-100 mt-2 animate-pulse">
              Vòng {roundNumber}/{MAX_ROUNDS} - Lượt của <span className={`${currentTeamIndex === 0 ? 'text-blue-300' : 'text-red-300'} font-bold`}>
                {teams[currentTeamIndex].name}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-5 bg-gradient-to-b from-blue-800 to-blue-600 p-4 rounded-lg text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/scoreboard_texture.png')] opacity-10"></div>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-3xl">{teams[0].flag}</span>
              <span className="font-bold text-lg uppercase text-blue-100">{teams[0].name}</span>
            </div>
            <div className="text-3xl font-bold relative z-10 bg-blue-900/50 px-8 py-2 rounded-lg backdrop-blur-sm border border-blue-400/30">
              {teams[0].score} - {teams[1].score}
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <span className="font-bold text-lg uppercase text-red-100">{teams[1].name}</span>
              <span className="text-3xl">{teams[1].flag}</span>
            </div>
          </div>

          {/* Thay đổi sân cỏ thành 3D */}
          <div 
            className="relative w-full h-[500px] rounded-lg overflow-hidden mb-5 shadow-2xl"
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Sân cỏ 3D */}
            <div 
              className="absolute inset-0"
              style={{
                transform: 'rotateX(5deg)',
                backgroundImage: 'linear-gradient(to bottom, #38a03c, #2d8a31)',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
              }}
            >
              {/* Texture cỏ 3D */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-light.png")',
                  opacity: 0.1
                }}
              ></div>
              
              {/* Hiệu ứng ánh sáng động */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
            </div>
            
            {/* Hiệu ứng độ sâu 3D */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
            
            {/* Crowd */}
            <div className="absolute top-0 left-0 right-0 h-12 crowd-pattern animate-crowd-wave border-b-2 border-dashed border-white/50 overflow-hidden">
              {/* Animated fans */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-6 h-6 mx-[2px] animate-fan-jump" style={{ animationDelay: `${Math.random() * 2}s` }}>
                    <div className={`w-full h-full rounded-full ${i % 3 === 0 ? 'bg-red-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stadium lights */}
            <div className="absolute top-0 left-0 w-1/2 h-80 bg-gradient-radial from-white/30 to-transparent opacity-70 blur-md"></div>
            <div className="absolute top-0 right-0 w-1/2 h-80 bg-gradient-radial from-white/30 to-transparent opacity-70 blur-md"></div>
            
            {/* Weather effects - conditionally add rain or spotlights */}
            {weather === 'rain' && (
              <div className="absolute inset-0 pointer-events-none z-[8]">
                {Array.from({ length: 100 }).map((_, i) => (
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

            {weather === 'sunny' && (
              <div className="absolute inset-0 pointer-events-none z-[8]">
                {/* Ánh sáng mặt trời */}
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[300px] h-[200px]"
                  style={{
                    background: 'radial-gradient(ellipse at top, rgba(255, 255, 200, 0.4) 0%, transparent 70%)',
                    filter: 'blur(10px)'
                  }}
                ></div>
                
                {/* Ánh lấp lánh trên cỏ */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${Math.random() * 4 + 2}px`,
                      height: `${Math.random() * 4 + 2}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.4 + 0.1,
                      animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {weather === 'night' && (
              <div className="absolute inset-0 pointer-events-none z-[8]">
                <div className="absolute inset-0 bg-blue-900/30"></div>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 30}%`,
                      opacity: Math.random() * 0.7 + 0.3,
                      animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Field lines - Sân bóng chân thực hơn */}
            {/* Vòng tròn giữa sân */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/40 z-[1]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/40 z-[1] bg-white/10"></div>

            {/* Khu vực cấm địa */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[400px] h-[200px] border-2 border-white/50 border-t-0 z-[1]">
              {/* Khu vực 6m */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[180px] h-[60px] border-2 border-white/50 border-b-0 z-[1]"></div>
              
              {/* Chấm phạt đền */}
              <div className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white/50 z-[1]"></div>
              
              {/* Vòng cung khu vực cấm */}
              <div className="absolute -bottom-[50px] left-1/2 transform -translate-x-1/2 w-[150px] h-[75px] border-t-2 border-white/50 rounded-t-full z-[1] border-l-2 border-r-2"></div>
            </div>

            {/* Line giữa sân */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-[2px] bg-white/50 z-[1]"></div>
            
            {/* Game info with shadow and glow */}
            <div className="absolute top-16 left-5 bg-black/80 text-white p-3 rounded z-10 backdrop-blur-sm border border-gray-700 shadow-lg animate-float">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-3xl mb-2 shadow-glow-orange">👤</div>
              <div className="text-gray-300 font-semibold">Score: <span className="text-white">{teams[0].score + teams[1].score}</span></div>
              <div className="text-gray-300 font-semibold">Question: <span className="text-white">{roundNumber}/{MAX_ROUNDS}</span></div>
            </div>
            
            {/* Timer with realistic display */}
            <div className="absolute top-3 right-3 text-4xl font-bold text-white bg-black/50 px-3 py-1 rounded font-mono tracking-wider animate-pulse-slow backdrop-blur-sm shadow-lg border border-gray-700">{time}</div>
            
            {/* Goal with proper football goal structure */}
            {/* Khung thành 3D */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[320px] h-[160px] z-[3]"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Cột dọc với hiệu ứng ánh sáng */}
              <div 
                className="absolute top-0 left-0 w-[8px] h-[160px] rounded-sm"
                style={{
                  background: 'linear-gradient(90deg, #f0f0f0, #ffffff, #e0e0e0)',
                  boxShadow: '2px 0px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                }}
              ></div>
              
              {/* Cột dọc phải với hiệu ứng ánh sáng */}
              <div 
                className="absolute top-0 right-0 w-[8px] h-[160px] rounded-sm"
                style={{
                  background: 'linear-gradient(270deg, #f0f0f0, #ffffff, #e0e0e0)',
                  boxShadow: '-2px 0px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                }}
              ></div>
              
              {/* Xà ngang với hiệu ứng ánh sáng */}
              <div 
                className="absolute top-0 left-0 right-0 h-[8px] rounded-sm"
                style={{
                  background: 'linear-gradient(0deg, #e0e0e0, #ffffff, #f0f0f0)',
                  boxShadow: '0px 2px 5px rgba(0,0,0,0.3), 0px 0px 10px rgba(255,255,255,0.5)'
                }}
              ></div>

              {/* Lưới với hiệu ứng thực tế hơn */}
              <div 
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 47%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,0.8) 52%, transparent 53%),
                    linear-gradient(0deg, transparent 47%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,0.8) 52%, transparent 53%)
                  `,
                  backgroundSize: '15px 15px',
                  opacity: 0.8,
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                }}
              ></div>
            </div>
            
            {/* Thủ môn với animation bay người */}
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
                  filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.4))',
                  transform: showResult ? 'scale(1.1)' : 'scale(1)',
                  height: '225px',
                }}
              />
              
              {/* Bóng đổ 3D */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-black/30 rounded-full blur-md w-[80px] h-[10px]"
                style={{
                  bottom: '-10px',
                  transformStyle: 'preserve-3d',
                  animation: showResult ? 'shadowMove 0.7s ease-out forwards' : ''
                }}
              ></div>
            </div>
            
            {/* Player - đặt cầu thủ lệch trái */}
            <div className={`absolute bottom-[30px] left-[45%] transform -translate-x-1/2 w-[50px] h-[100px] z-[3] ${playerAnimation}`}>
              <div className={`player-container ${teams[currentTeamIndex].name === "Đội Xanh" ? "player-blue" : "player-red"}`}>
                {/* Đầu */}
                <div className="player-head">
                  <div className="player-face"></div>
                  <div className="player-hair"></div>
                </div>
                
                {/* Thân */}
                <div className="player-body">
                  {/* Số áo */}
                  <div className="player-number">7</div>
                </div>
                
                {/* Tay trái */}
                <div className="player-arm player-arm-left"></div>
                
                {/* Tay phải */}
                <div className="player-arm player-arm-right"></div>
                
                {/* Chân trái */}
                <div className="player-leg player-leg-left">
                  <div className="player-shoe player-shoe-left"></div>
                </div>
                
                {/* Chân phải */}
                <div className="player-leg player-leg-right">
                  <div className="player-shoe player-shoe-right"></div>
                </div>
              </div>
              
              {/* Player shadow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[40px] h-[6px] bg-black/30 filter blur-sm rounded-full"></div>
            </div>
            
            {/* Ball with simpler 2D style - đặt ở chấm penalty */}
            <div
              className={`absolute bottom-[40px] left-1/2 transform -translate-x-1/2 w-[40px] h-[40px] z-[5]`}
              style={{
                animation: showResult ? (
                  isCorrect ? (
                    kickDirection === 'left' ? 'ballGoalLeft 1.2s ease-out forwards' :
                    kickDirection === 'right' ? 'ballGoalRight 1.2s ease-out forwards' :
                    'ballGoalCenter 1.2s ease-out forwards'
                  ) : (
                    kickDirection === 'left' ? 'ballSaveLeft 1.2s ease-out forwards' :
                    kickDirection === 'right' ? 'ballSaveRight 1.2s ease-out forwards' :
                    'ballSaveCenter 1.2s ease-out forwards'
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
                  animation: showResult ? 'ballRotate 1.2s linear forwards' : ''
                }}
              />
            </div>
            
            {/* Penalty mark with glow effect */}
            <div className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2 w-[8px] h-[8px] bg-white rounded-full shadow-glow z-[2]"></div>
            
            {/* Celebration effects */}
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none z-[10]">
                {/* Confetti */}
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-3 h-3 animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                      animationDelay: `${Math.random() * 1}s`,
                      clipPath: i % 2 === 0 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none'
                    }}
                  ></div>
                ))}
                
                {/* Goal flash - giảm độ mạnh */}
                <div className="absolute inset-0 bg-white opacity-40 animate-goal-flash"></div>
                
                {/* Text animation */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white animate-goal-text tracking-widest">GOAL!</div>
              </div>
            )}

            {/* Hiệu ứng cỏ bay khi đá bóng */}
            {showResult && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[4]">
                {Array.from({ length: 15 }).map((_, i) => (
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

            {/* Hiệu ứng bụi khi thủ môn nhảy */}
            {showResult && !isCorrect && (
              <div 
                className="absolute z-[3]"
                style={{
                  top: kickDirection === 'center' ? '150px' : '120px',
                  left: kickDirection === 'left' ? '35%' : kickDirection === 'right' ? '65%' : '50%',
                  transform: 'translateX(-50%)'
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
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
          </div>

          {/* Game Modal khi kết thúc */}
          {gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
              <div className="max-w-2xl w-full bg-gradient-to-b from-blue-900/90 to-purple-900/90 rounded-2xl p-8 shadow-2xl border-2 border-blue-400/30 backdrop-blur-md relative overflow-hidden animate-scaleIn">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[url('/images/confetti_bg.png')] opacity-10 animate-slide"></div>
                <div className="absolute inset-0 bg-gradient-radial from-transparent to-blue-900/50"></div>
                
                {/* Trophy and team info */}
                <div className="relative z-10 text-center">
                  <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-6 drop-shadow-lg">
                    {teams[0].score > teams[1].score 
                      ? "CHIẾN THẮNG!" 
                      : teams[1].score > teams[0].score 
                        ? "CHIẾN THẮNG!" 
                        : "HÒA!"}
                  </h2>
                  
                  {/* Final score */}
                  <div className="flex justify-center items-center gap-8 my-8">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{teams[0].flag}</div>
                      <div className="font-bold text-blue-200">{teams[0].name}</div>
                    </div>
                    
                    <div className="text-5xl font-bold text-white bg-blue-900/50 px-6 py-3 rounded-lg border border-blue-400/30">
                      {teams[0].score} - {teams[1].score}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl mb-2">{teams[1].flag}</div>
                      <div className="font-bold text-red-200">{teams[1].name}</div>
                    </div>
                  </div>
                  
                  {/* Winner announcement */}
                  <div className="text-3xl text-white font-bold mb-8">
                    {teams[0].score > teams[1].score 
                      ? <>{teams[0].flag} {teams[0].name} chiến thắng!</> 
                      : teams[1].score > teams[0].score 
                        ? <>{teams[1].flag} {teams[1].name} chiến thắng!</> 
                        : 'Trận đấu hòa!'}
                  </div>
                  
                  {/* Trophy animation */}
                  <div className="mx-auto w-32 h-32 mb-8 text-7xl animate-trophy">🏆</div>
                  
                  {/* Buttons */}
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
                
                {/* Fireworks effect */}
                {teams[0].score !== teams[1].score && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
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

          {/* Phần câu hỏi và đáp án - hiển thị khi không phải gameOver */}
          {!gameOver && (
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg shadow-2xl border border-blue-900/50">
              <div className="text-2xl mb-6 text-center font-bold bg-gradient-to-r from-blue-200 to-blue-100 text-transparent bg-clip-text animate-pulse-slow">{currentQuestion?.text}</div>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion?.options.map((option, index) => (
                  <button 
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showResult}
                    className={`p-5 rounded-lg text-base transition-all transform hover:scale-105 shadow-lg ${
                      showResult && index === currentQuestion.correctAnswer ? 'bg-gradient-to-r from-green-600 to-green-400 text-white' : 
                      showResult && selectedOption === index && selectedOption !== currentQuestion.correctAnswer ? 'bg-gradient-to-r from-red-600 to-red-400 text-white' :
                      selectedOption === index ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white' : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 hover:from-blue-700 hover:to-blue-500 hover:text-white'
                    } border-b-4 ${
                      showResult && index === currentQuestion.correctAnswer ? 'border-green-800' :
                      showResult && selectedOption === index && selectedOption !== currentQuestion.correctAnswer ? 'border-red-800' :
                      'border-gray-900'
                    }`}
                  >
                    <span className="text-lg font-bold mr-2">{['A', 'B', 'C', 'D'][index]}</span> {option}
                  </button>
                ))}
              </div>
              
              {showResult && (
                <div className={`text-2xl font-bold text-center my-5 p-4 rounded-lg backdrop-blur-sm ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'} animate-bounce-slow shadow-lg border ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  {isCorrect ? '🎉 GOOOOAL! Bạn đã trả lời đúng! 🎉' : '😢 Thủ môn đã cản phá! Bạn trả lời sai rồi! 😢'}
                </div>
              )}
              
              {showNextButton && (
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={handleNextTurn}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full hover:from-blue-500 hover:to-blue-300 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-xl"
                  >
                    {roundNumber === MAX_ROUNDS && currentTeamIndex === 1 ? 'Kết thúc trận đấu' : 'Lượt tiếp theo ➜'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Firework particles */}
          {gameOver && teams[0].score !== teams[1].score && (
            <div className="absolute inset-0 pointer-events-none z-[20]">
              {Array.from({ length: 100 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.random() * 6 + 2}px`,
                    height: `${Math.random() * 6 + 2}px`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    top: `${Math.random() * 70}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.7 + 0.3,
                    animation: `fireworkParticle ${Math.random() * 2 + 2}s ease-out forwards ${Math.random() * 3}s`,
                    transform: `scale(${Math.random() * 0.8 + 0.2})`
                  } as React.CSSProperties}
                ></div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
