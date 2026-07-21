'use client';
import { useState, useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';
import BloomLogo from '@/components/BloomLogo';
import Flower from '@/components/Flower';
import { QUESTIONS, QUOTES, getDayOfYear, getTimeOfDayGreeting, FLOWER_COLORS } from '@/lib/data';

const PRICING_URL = 'https://bloom-website-rosy.vercel.app/pricing';

// Helper: today's date as YYYY-MM-DD string for localStorage
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BloomTry() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  // Today's state
  const [answer, setAnswer] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [hasPlantedToday, setHasPlantedToday] = useState(false);
  const [todaysReflection, setTodaysReflection] = useState<string | null>(null);
  const [showReflectionQuestion, setShowReflectionQuestion] = useState(false); // for flip

  // Session counters
  const [streak, setStreak] = useState(0);
  const [blooms, setBlooms] = useState(0);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationColor, setCelebrationColor] = useState('#C17F59');
  const [hasSeenFirstCelebration, setHasSeenFirstCelebration] = useState(false);

  // Daily rotating content
  const [greeting, setGreeting] = useState('Good day');
  const [dailyQ, setDailyQ] = useState(QUESTIONS[0]);
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── On mount: load everything from localStorage, respecting today's date ─
  useEffect(() => {
    const day = getDayOfYear();
    setDailyQ(QUESTIONS[day % QUESTIONS.length]);
    setDailyQuote(QUOTES[day % QUOTES.length]);
    setGreeting(getTimeOfDayGreeting());

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('bloom_try_name');
      if (savedName) {
        setName(savedName);
        setShowWelcome(false);
      }

      // Check if they've already planted TODAY specifically
      const plantedDate = localStorage.getItem('bloom_try_planted_date');
      const savedReflection = localStorage.getItem('bloom_try_reflection');
      const savedStreak = localStorage.getItem('bloom_try_streak');
      const savedBlooms = localStorage.getItem('bloom_try_total_blooms');

      if (plantedDate === todayKey()) {
        setHasPlantedToday(true);
        if (savedReflection) setTodaysReflection(savedReflection);
      }

      if (savedStreak) setStreak(parseInt(savedStreak, 10) || 0);
      if (savedBlooms) setBlooms(parseInt(savedBlooms, 10) || 0);

      const seenCelebration = localStorage.getItem('bloom_try_seen_celebration');
      if (seenCelebration === 'true') setHasSeenFirstCelebration(true);
    }
    setMounted(true);
  }, []);

  const handleNameSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    localStorage.setItem('bloom_try_name', trimmed);
    setName(trimmed);
    setShowWelcome(false);
    track('name_entered');
  };

  const handlePlantBloom = () => {
    const trimmedAnswer = answer.trim();
    const hadAnswer = trimmedAnswer.length > 0;

    // Update session state
    const newBlooms = blooms + 1;
    const newStreak = streak === 0 ? 1 : streak;
    setBlooms(newBlooms);
    setStreak(newStreak);

    // Save the reflection for today (only if there was an answer)
    localStorage.setItem('bloom_try_planted_date', todayKey());
    localStorage.setItem('bloom_try_total_blooms', String(newBlooms));
    localStorage.setItem('bloom_try_streak', String(newStreak));

    if (hadAnswer) {
      localStorage.setItem('bloom_try_reflection', trimmedAnswer);
      setTodaysReflection(trimmedAnswer);
    } else {
      localStorage.removeItem('bloom_try_reflection');
      setTodaysReflection(null);
    }

    setHasPlantedToday(true);
    setShowTextarea(false);

    // Trigger the celebration animation
    const randomColor = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
    setCelebrationColor(randomColor);
    setShowCelebration(true);

    // Mark first celebration as seen
    if (!hasSeenFirstCelebration) {
      localStorage.setItem('bloom_try_seen_celebration', 'true');
      setHasSeenFirstCelebration(true);
    }

    // Auto-hide celebration after ~3.5s
    setTimeout(() => {
      setShowCelebration(false);
    }, 3500);

    track('bloom_planted', { hadAnswer });
  };

  const handleCancel = () => {
    setAnswer('');
    setShowTextarea(false);
  };

  const handleSignupClick = () => {
    track('signup_click');
  };

  const handleResetName = () => {
    // Full reset — clears everything, useful for testing / privacy
    localStorage.removeItem('bloom_try_name');
    localStorage.removeItem('bloom_try_planted_date');
    localStorage.removeItem('bloom_try_reflection');
    localStorage.removeItem('bloom_try_streak');
    localStorage.removeItem('bloom_try_total_blooms');
    localStorage.removeItem('bloom_try_seen_celebration');
    setName('');
    setStreak(0);
    setBlooms(0);
    setHasPlantedToday(false);
    setTodaysReflection(null);
    setHasSeenFirstCelebration(false);
    setShowWelcome(true);
  };

  const handleFlipReflection = () => {
    setShowReflectionQuestion(prev => !prev);
    track('reflection_flipped');
  };

  // ─── LOADING STATE ─────────
  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          opacity: 0.4,
          fontFamily: 'Playfair Display, serif',
          fontStyle: 'italic',
          color: 'var(--brown-l)',
        }}>
          Loading your moment...
        </div>
      </main>
    );
  }

  // ─── SCREEN 1: WELCOME ─────────
  if (showWelcome) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 50% at 30% 10%, rgba(181,199,169,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(232,196,184,0.25) 0%, transparent 60%)
          `,
        }} />

        <div style={{
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          animation: 'fadeUp 0.8s ease both',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <BloomLogo size={56} />
          </div>

          <h1 style={{ fontSize: 32, color: 'var(--ink)', marginBottom: 12 }}>
            Welcome to <em style={{ color: 'var(--terra-d)' }}>bloom</em>
          </h1>

          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--brown-m)',
            lineHeight: 1.5,
            marginBottom: 36,
          }}>
            A safe space to reflect.<br />One tap a day.
          </p>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 18,
            padding: '26px 22px',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-soft)',
            marginBottom: 18,
          }}>
            <label htmlFor="name" style={{
              display: 'block',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--sage-d)',
              marginBottom: 12,
              fontWeight: 600,
            }}>
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name"
              autoFocus
              maxLength={30}
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: 16,
                fontFamily: 'Playfair Display, serif',
                background: 'var(--bg)',
                border: '1.5px solid var(--card-border)',
                borderRadius: 12,
                color: 'var(--brown)',
                outline: 'none',
                marginBottom: 14,
                textAlign: 'center',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--terra)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
            />
            <button
              onClick={handleNameSubmit}
              disabled={name.trim().length < 1}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px' }}
            >
              Enter your garden
            </button>
          </div>

          <p style={{
            fontSize: 11,
            color: 'var(--brown-l)',
            fontStyle: 'italic',
            opacity: 0.75,
          }}>
            This is a free taste of Bloom.<br />
            Your name stays in your browser. Nothing is saved.
          </p>
        </div>
      </main>
    );
  }

  // ─── SCREEN 2: MAIN APP ─────────
  return (
    <main style={{
      minHeight: '100vh',
      padding: '20px 20px 60px',
      position: 'relative',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 50% at 30% 10%, rgba(181,199,169,0.15) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(232,196,184,0.15) 0%, transparent 60%)
        `,
      }} />

      <div style={{
        maxWidth: 420,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeUp 0.5s ease both',
      }}>

        {/* Header: greeting + settings gear */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}>
          <div>
            <p style={{
              fontSize: 11,
              color: 'var(--sage)',
              marginBottom: 1,
              fontFamily: 'Lora, serif',
            }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: 18, color: 'var(--ink)' }}>
              {name}
            </h1>
          </div>

          <button
            onClick={handleResetName}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--card-border)',
              borderRadius: 10,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Reset your session"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6A5A" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Streak card */}
        <div style={{
          background: 'var(--sage-bg)',
          borderRadius: 14,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 22, display: 'inline-block' }}>🌱</span>
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'Lora, serif',
            }}>
              {streak === 0 ? "Plant your first bloom" : `${streak} day streak!`}
            </p>
            <p style={{ fontSize: 11, color: 'var(--brown-l)' }}>
              {blooms} bloom{blooms !== 1 ? 's' : ''} planted
            </p>
          </div>
        </div>

        {/* Daily quote card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 18,
          padding: '20px 22px',
          marginBottom: 16,
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--card-border)',
        }}>
          <p style={{
            fontSize: 10,
            color: 'var(--sage)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 10,
            fontWeight: 500,
          }}>
            Daily bloom
          </p>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--ink)',
            lineHeight: 1.7,
            marginBottom: 10,
          }}>
            &ldquo;{dailyQuote.text}&rdquo;
          </p>
          <p style={{
            fontSize: 12,
            color: 'var(--sage)',
            fontWeight: 500,
          }}>
            — {dailyQuote.author}
          </p>
        </div>

        {/* ═══ EITHER: Question card (not yet planted) ═══ */}
        {!hasPlantedToday && !showTextarea && (
          <button
            onClick={() => setShowTextarea(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #C17F59, #A66B45)',
              border: 'none',
              borderRadius: 16,
              padding: '20px 22px',
              textAlign: 'left',
              marginBottom: 16,
              boxShadow: '0 4px 18px rgba(193, 127, 89, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span>🌿</span>
              <span style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Today&apos;s question · {dailyQ.cat}
              </span>
            </div>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 15,
              color: '#fff',
              lineHeight: 1.5,
              marginBottom: 10,
            }}>
              {dailyQ.q}
            </p>
            <p style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.55)',
            }}>
              Tap to answer →
            </p>
          </button>
        )}

        {/* ═══ EITHER: Question card + textarea (writing) ═══ */}
        {!hasPlantedToday && showTextarea && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{
              background: 'linear-gradient(135deg, #C17F59, #A66B45)',
              borderRadius: '16px 16px 0 0',
              padding: '20px 22px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span>🌿</span>
                <span style={{
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Today&apos;s question · {dailyQ.cat}
                </span>
              </div>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 15,
                color: '#fff',
                lineHeight: 1.5,
              }}>
                {dailyQ.q}
              </p>
            </div>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '0 0 16px 16px',
              padding: '14px 22px 18px',
              marginBottom: 14,
              border: '1px solid var(--card-border)',
              borderTop: 'none',
              boxShadow: 'var(--shadow-card)',
            }}>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Take a breath. Answer honestly, or just a few words..."
                autoFocus
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '12px 14px',
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: 'Playfair Display, serif',
                  fontStyle: answer ? 'normal' : 'italic',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--card-border)',
                  borderRadius: 10,
                  color: 'var(--brown)',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--terra)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
              />
            </div>
          </div>
        )}

        {/* ═══ OR: "Bloom is planted" card (already planted today) ═══ */}
        {hasPlantedToday && (
          <div style={{
            background: 'var(--sage-bg)',
            borderRadius: 16,
            padding: '24px 22px',
            marginBottom: 16,
            textAlign: 'center',
            animation: 'fadeUp 0.5s ease both',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 12,
              animation: showCelebration ? 'flowerBurst 1.2s cubic-bezier(0.22,1,0.36,1) both' : 'none',
            }}>
              <span style={{ fontSize: 34 }}>🌸</span>
            </div>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--sage-d)',
              fontWeight: 500,
              marginBottom: 6,
            }}>
              Today&apos;s bloom is planted!
            </p>
            <p style={{
              fontSize: 12,
              color: 'var(--brown-l)',
              fontFamily: 'Lora, serif',
            }}>
              Come back tomorrow for a new question
            </p>
          </div>
        )}

        {/* ═══ Action buttons (only when NOT yet planted today) ═══ */}
        {!hasPlantedToday && (
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'stretch',
            marginBottom: 16,
          }}>
            {showTextarea && (
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handlePlantBloom}
              className="btn btn-primary"
              style={{
                flex: showTextarea ? 1.4 : 1,
                width: showTextarea ? undefined : '100%',
                padding: '14px 20px',
              }}
            >
              Plant Bloom 🌸
            </button>
          </div>
        )}

        {/* ═══ TODAY'S REFLECTION FLIP CARD (only if answered) ═══ */}
        {hasPlantedToday && todaysReflection && (
          <div style={{ marginTop: 24, animation: 'fadeUp 0.6s ease 0.2s both' }}>
            <p style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--sage-d)',
              fontWeight: 600,
              marginBottom: 10,
              paddingLeft: 4,
              fontFamily: 'Lora, serif',
            }}>
              Today&apos;s reflection
            </p>

            <div
              className={`flip-card ${showReflectionQuestion ? 'flipped' : ''}`}
              onClick={handleFlipReflection}
              style={{ cursor: 'pointer', minHeight: 140 }}
            >
              <div className="flip-card-inner" style={{ minHeight: 140 }}>

                {/* FRONT: The answer */}
                <div
                  className="flip-card-face"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,196,184,0.35) 0%, rgba(240,213,200,0.25) 100%)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    borderLeft: '3px solid var(--terra)',
                    minHeight: 140,
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 10,
                    color: 'var(--brown-l)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'Lora, serif',
                  }}>
                    <span style={{ fontSize: 12 }}>↻</span> tap
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: 'var(--terra-d)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontFamily: 'Lora, serif',
                  }}>
                    {name} (you)
                  </p>
                  <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontStyle: 'italic',
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: 'var(--brown)',
                    paddingRight: 40,
                  }}>
                    {todaysReflection}
                  </p>
                </div>

                {/* BACK: The question */}
                <div
                  className="flip-card-face flip-card-back"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,196,184,0.35) 0%, rgba(240,213,200,0.25) 100%)',
                    borderRadius: 16,
                    padding: '18px 20px',
                    borderLeft: '3px solid var(--terra)',
                    minHeight: 140,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 10,
                    color: 'var(--brown-l)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'Lora, serif',
                  }}>
                    <span style={{ fontSize: 12 }}>↻</span> tap
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: 'var(--terra-d)',
                    fontWeight: 600,
                    marginBottom: 8,
                    fontFamily: 'Lora, serif',
                    letterSpacing: '0.08em',
                  }}>
                    QUESTION · {dailyQ.cat.toUpperCase()}
                  </p>
                  <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontStyle: 'italic',
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: 'var(--brown)',
                    paddingRight: 40,
                  }}>
                    {dailyQ.q}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CELEBRATION OVERLAY (big flower burst on plant) ═══ */}
        {showCelebration && (
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(250,247,242,0.85) 0%, rgba(250,247,242,0) 70%)',
            animation: 'fadeIn 0.4s ease both',
          }}>
            <div style={{
              textAlign: 'center',
              animation: 'bloomCelebrateIn 1s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <div style={{
                animation: 'flowerBurst 1.2s cubic-bezier(0.22,1,0.36,1) both, floatGentle 3s ease-in-out infinite 1.2s',
                marginBottom: 20,
              }}>
                <Flower color="#2F4032" centerColor={celebrationColor} size={100} />
              </div>
              <p style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: 'var(--sage-d)',
                fontWeight: 600,
                marginBottom: 10,
                fontFamily: 'Lora, serif',
                animation: 'fadeIn 0.6s ease 0.6s both',
              }}>
                Your Garden
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 24,
                color: 'var(--ink)',
                marginBottom: 6,
                animation: 'fadeUp 0.8s ease 0.8s both',
              }}>
                A bloom is <em style={{ color: 'var(--terra-d)' }}>planted</em> 🌸
              </p>
              <p style={{
                fontSize: 13,
                color: 'var(--brown-m)',
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                animation: 'fadeUp 0.8s ease 1.1s both',
              }}>
                in your garden
              </p>
            </div>
          </div>
        )}

        {/* Subtle footer with link to real site */}
        <div style={{
          marginTop: 50,
          textAlign: 'center',
          paddingTop: 20,
          borderTop: '1px solid var(--card-border)',
        }}>
          <p style={{
            fontSize: 12,
            color: 'var(--brown-l)',
            fontStyle: 'italic',
            lineHeight: 1.6,
            fontFamily: 'Lora, serif',
          }}>
            {hasPlantedToday ? (
              <>
                Want to remember your Bloom?<br />
                <a
                  href={PRICING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSignupClick}
                  style={{
                    color: 'var(--terra-d)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--terra-l)',
                  }}
                >
                  Create your own Garden →
                </a>
              </>
            ) : (
              <>
                Want it to remember your garden?{' '}
                <a
                  href={PRICING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSignupClick}
                  style={{
                    color: 'var(--terra-d)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--terra-l)',
                  }}
                >
                  Get the real Bloom →
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
