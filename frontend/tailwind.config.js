/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter','sans-serif'],
        mono: ['"JetBrains Mono"','monospace'],
      },
      colors: {
        bg:      '#000000',
        surface: '#060608',
        card:    '#0c0c12',
        'card-bright':'#131320',
        border:  'rgba(255,255,255,0.06)',
        'border-hi':'rgba(255,255,255,0.12)',
        violet:  '#7c3aed',
        indigo:  '#6366f1',
        cyan:    '#06b6d4',
        gold:    '#f5a623',
        success: '#22c55e',
        warn:    '#f59e0b',
        danger:  '#ef4444',
        muted:   '#4b5563',
        sub:     '#9ca3af',
        dim:     '#c4c2be',
        text:    '#f0eeeb',
      },
      boxShadow: {
        glass:         '0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        'violet-glow': '0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.1)',
        'card-hover':  '0 0 0 1px rgba(124,58,237,0.4), 0 8px 32px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'hero-glow':   'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(124,58,237,0.25) 0%, transparent 65%)',
        'grid-lines':  `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease both',
        'fade-in':  'fadeIn 0.4s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
        shimmer:    'shimmer 2s linear infinite',
        float:      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from:{opacity:0,transform:'translateY(18px)'}, to:{opacity:1,transform:'translateY(0)'} },
        fadeIn:  { from:{opacity:0}, to:{opacity:1} },
        scaleIn: { from:{opacity:0,transform:'scale(0.94)'}, to:{opacity:1,transform:'scale(1)'} },
        shimmer: { from:{backgroundPosition:'-200% 0'}, to:{backgroundPosition:'200% 0'} },
        float:   { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-6px)'} },
      },
    },
  },
  plugins: [],
}
