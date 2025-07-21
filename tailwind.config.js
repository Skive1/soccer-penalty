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
        'ballHover': 'ballHover 2s ease-in-out infinite',
        'ballShadowHover': 'ballShadowHover 2s ease-in-out infinite',
        'ballRotate': 'ballRotate3D 1s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.5s ease-out forwards',
        'snowDrop': 'snowDrop 6s linear infinite',
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
        ballHover: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' }
        },
        ballShadowHover: {
          '0%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(0.8)', opacity: 0.2 },
          '100%': { transform: 'scale(1)', opacity: 0.3 }
        },
        snowDrop: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)' },
          '50%': { transform: 'translateY(250px) rotate(180deg)' },
          '100%': { transform: 'translateY(500px) rotate(360deg)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        fireworkParticle: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '100%': { transform: 'translate(var(--x, 0), var(--y, 0))', opacity: 0 }
        }
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(255,255,255,0.5)',
        'glow-orange': '0 0 15px 5px rgba(255,165,0,0.5)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}