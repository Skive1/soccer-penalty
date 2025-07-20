/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'crowd-wave': 'crowdWave 3s linear infinite',
        'fall': 'fall 3s linear forwards',
        'confetti': 'confetti 4s ease-in forwards',
        'goal-flash': 'goalFlash 0.8s ease-out forwards',
        'goal-text': 'goalText 2s ease-out forwards',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'trophy': 'trophy 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide': 'slide 20s linear infinite',
        'fan-jump': 'fanJump 0.5s ease-in-out infinite',
        'rain': 'rain 0.8s linear infinite',
        'flash': 'flash 5s ease-in-out infinite',
        'ball-goal-left': 'ballGoalLeft 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ball-goal-right': 'ballGoalRight 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ball-goal-center': 'ballGoalCenter 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ball-save-left': 'ballSaveLeft 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ball-save-right': 'ballSaveRight 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'ball-save-center': 'ballSaveCenter 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'goalkeeper-save-left': 'goalkeeperSaveLeft 0.5s ease-out forwards',
        'goalkeeper-save-right': 'goalkeeperSaveRight 0.5s ease-out forwards',
        'goalkeeper-save-center': 'goalkeeperSaveCenter 0.5s ease-out forwards',
        'player-kick': 'playerKick 0.5s ease-out forwards',
        'goalkeeper-catch': 'goalkeeperCatch 0.3s ease-out forwards',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        crowdWave: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 0' },
        },
        fall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(500px) rotate(360deg)', opacity: '0' }
        },
        confetti: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': { transform: 'translateY(500px) rotate(720deg)', opacity: 0 }
        },
        goalFlash: {
          '0%': { opacity: '0.4' },
          '20%': { opacity: '0.6' },
          '40%': { opacity: '0.4' },
          '60%': { opacity: '0.2' },
          '100%': { opacity: '0' }
        },
        goalText: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1 },
          '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
        },
        trophy: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(5deg)' },
          '50%': { transform: 'translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' }
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        slide: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        fanJump: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' }
        },
        rain: {
          '0%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(500px)' }
        },
        flash: {
          '0%': { opacity: 0 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 0 }
        },
        ballGoalLeft: {
          '0%': { bottom: '3rem', left: '50%', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '30%': { bottom: '8rem', left: '45%', transform: 'translateX(-50%) rotate(180deg) scale(0.9)', opacity: 1 },
          '60%': { bottom: '15rem', left: '35%', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '20rem', left: '35%', transform: 'translateX(-50%) rotate(720deg) scale(0.8)', opacity: 1 }
        },
        ballGoalRight: {
          '0%': { bottom: '3rem', left: '50%', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '30%': { bottom: '8rem', left: '55%', transform: 'translateX(-50%) rotate(180deg) scale(0.9)', opacity: 1 },
          '60%': { bottom: '15rem', left: '65%', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '20rem', left: '65%', transform: 'translateX(-50%) rotate(720deg) scale(0.8)', opacity: 1 }
        },
        ballGoalCenter: {
          '0%': { bottom: '3rem', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '30%': { bottom: '8rem', transform: 'translateX(-50%) rotate(180deg) scale(0.9)', opacity: 1 },
          '60%': { bottom: '15rem', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '20rem', transform: 'translateX(-50%) rotate(720deg) scale(0.8)', opacity: 1 }
        },
        ballSaveLeft: {
          '0%': { bottom: '3rem', left: '50%', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '70%': { bottom: '15rem', left: '35%', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '18rem', left: '35%', transform: 'translateX(-50%) rotate(720deg) scale(0.7)', opacity: 0 }
        },
        ballSaveRight: {
          '0%': { bottom: '3rem', left: '50%', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '70%': { bottom: '15rem', left: '65%', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '18rem', left: '65%', transform: 'translateX(-50%) rotate(720deg) scale(0.7)', opacity: 0 }
        },
        ballSaveCenter: {
          '0%': { bottom: '3rem', transform: 'translateX(-50%) rotate(0deg)', opacity: 1 },
          '70%': { bottom: '15rem', transform: 'translateX(-50%) rotate(360deg) scale(0.9)', opacity: 1 },
          '100%': { bottom: '18rem', transform: 'translateX(-50%) rotate(720deg) scale(0.7)', opacity: 0 }
        },
        goalkeeperSaveLeft: {
          '0%': { transform: 'translateX(-50%) rotate(0deg)' },
          '100%': { transform: 'translateX(-120px) rotate(-15deg)' }
        },
        goalkeeperSaveRight: {
          '0%': { transform: 'translateX(-50%) rotate(0deg)' },
          '100%': { transform: 'translateX(20px) rotate(15deg)' }
        },
        goalkeeperSaveCenter: {
          '0%': { transform: 'translateX(-50%) scaleY(1)' },
          '100%': { transform: 'translateX(-50%) scaleY(0.8) translateY(20px)' }
        },
        goalkeeperCatch: {
          '0%': { transform: 'translateX(-50%) scale(1)' },
          '50%': { transform: 'translateX(-50%) scale(1.1)' },
          '100%': { transform: 'translateX(-50%) scale(1)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
