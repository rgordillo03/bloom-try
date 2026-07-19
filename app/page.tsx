'use client';
import { useState, useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';
import BloomLogo from '@/components/BloomLogo';
import Flower from '@/components/Flower';
import { QUESTIONS, QUOTES, getDayOfYear, getTimeOfDayGreeting, FLOWER_COLORS } from '@/lib/data';

type Step = 'welcome' | 'app' | 'planted' | 'blooming';

export default function BloomTry() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [answer, setAnswer] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [streak, setStreak] = useState(0);
  const [blooms, setBlooms] = useState(0);
  const [flowerColor, setFlowerColor] = useState('#C17F59');
  const [greeting, setGreeting] = useState('Good day');
  const [dailyQ, setDailyQ] = useState(QUESTIONS[0]);
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [hasSeenPlantedScreen, setHasSeenPlantedScreen] = useState(false);
  const [subtleBloomTrigger, setSubtleBloomTrigger] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // On mount: pick daily content + load name from localStorage
  useEffect(() => {
    const day = getDayOfYear();
    setDailyQ(QUESTIONS[day % QUESTIONS.length]);
    setDailyQuote(QUOTES[day % QUOTES.length]);
    setGreeting(getTimeOfDayGreeting());

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('bloom_try_name');
      if (savedName) {
        setName(savedName);
        setStep('app');
      }
      // Check if they've seen the planted celebration screen before
      const seen = localStorage.getItem('bloom_try_seen_planted');
      if (seen === 'true') setHasSeenPlantedScreen(true);
    }
    setMounted(true);
  }, []);

  const handleNameSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    localStorage.setItem('bloom_try_name', trimmed);
    setName(trimmed);
    setStep('app');
    track('name_entered');
  };

  const handlePlantBloom = () => {
    setBlooms(b => b + 1);
    if (streak === 0) setStreak(1);
    setFlowerColor(FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]);
    track('bloom_planted', { hadAnswer: answer.trim().length > 0 });

    // First time → show full celebration screen
    // Return visits → play subtle inline animation
    if (!hasSeenPlantedScreen) {
      setStep('planted');
      localStorage.setItem('bloom_try_seen_planted', 'true');
      setHasSeenPlantedScreen(true);
    } else {
      // Subtle inline bloom animation
      setStep('blooming');
      setSubtleBloomTrigger(t => t + 1);
      setTimeout(() => {
        setStep('app');
        setAnswer('');
        setShowTextarea(false);
      }, 1800);
    }
  };

  const handleAnother = () => {
    setAnswer('');
    setShowTextarea(false);
    setStep('app');
    track('another_moment');
  };

  const handleCancel = () => {
    setAnswer('');
    setShowTextarea(false);
  };

  const handleSignupClick = () => {
    track('signup_click');
  };

  const handleResetName = () => {
    localStorage.removeItem('bloom_try_name');
    localStorage.removeItem('bloom_try_seen_planted');
    setName('');
    setHasSeenPlantedScreen(false);
    setStep('welcome');
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
  if (step === 'welcome') {
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

          <h1 style={{
            fontSize: 32,
            color: 'var(--ink)',
            marginBottom: 12,
          }}>
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

  // ─── SCREEN 2: MAIN APP (matches real Bloom app) ─────────
  if (step === 'app' || step === 'blooming') {
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
          animation: step === 'blooming' ? 'none' : 'fadeUp 0.5s ease both',
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
              <h1 style={{
                fontSize: 18,
                color: 'var(--ink)',
              }}>
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
              title="Change name / reset"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6A5A" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* Streak card — with sprout emoji like real app */}
          <div style={{
            background: 'var(--sage-bg)',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{
              fontSize: 22,
              display: 'inline-block',
              animation: step === 'blooming' ? 'gentleBloom 1.5s ease' : 'none',
            }}>🌱</span>
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

          {/* Question card — big terracotta gradient button like real app */}
          {!showTextarea && (
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

          {/* Expanded textarea view */}
          {showTextarea && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {/* Question header (still visible) */}
              <div style={{
                background: 'linear-gradient(135deg, #C17F59, #A66B45)',
                borderRadius: '16px 16px 0 0',
                padding: '20px 22px 14px',
                marginBottom: 0,
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

              {/* Textarea below the question */}
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

          {/* Action buttons — always visible, "Plant Bloom" always works */}
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'stretch',
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
                animation: step === 'blooming' ? 'gentleBloom 0.8s ease' : 'none',
              }}
            >
              Plant Bloom{' '}
              <span style={{
                display: 'inline-block',
                animation: step === 'blooming' ? 'bloomGrow 1.2s ease' : 'none',
              }}>🌸</span>
            </button>
          </div>

          {/* Subtle "your reflection is being planted" indicator during return-visit blooms */}
          {step === 'blooming' && (
            <div style={{
              textAlign: 'center',
              marginTop: 20,
              animation: 'fadeIn 0.4s ease both',
            }}>
              <p style={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--sage-d)',
              }}>
                A bloom is planted in your garden 🌸
              </p>
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
              Want it to remember your garden?{' '}
              <a
                href="https://trybloom.co/pricing"
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
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ─── SCREEN 3: PLANTED (only shown FIRST time) ─────────
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
          radial-gradient(ellipse 80% 50% at 50% 30%, rgba(232,196,184,0.3) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 30% 80%, rgba(181,199,169,0.2) 0%, transparent 60%)
        `,
      }} />

      <div style={{
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeUp 0.6s ease both',
      }}>
        {/* Blooming flower — your real logo, animated */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Flower color="#2F4032" centerColor={flowerColor} size={90} animated />
        </div>

        <p style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--sage-d)',
          fontWeight: 600,
          marginBottom: 14,
          animation: 'fadeIn 1s ease 0.6s both',
          fontFamily: 'Lora, serif',
        }}>
          Your Garden
        </p>

        <h2 style={{
          fontSize: 30,
          color: 'var(--ink)',
          marginBottom: 14,
          lineHeight: 1.2,
          animation: 'fadeUp 1s ease 0.8s both',
        }}>
          A bloom is <em style={{ color: 'var(--terra-d)' }}>planted.</em>
        </h2>

        <p style={{
          fontFamily: 'Playfair Display, serif',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.55,
          color: 'var(--brown-m)',
          marginBottom: 40,
          animation: 'fadeUp 1s ease 1s both',
        }}>
          Take a breath. Notice how you feel.<br />
          That&apos;s the whole practice.
        </p>

        {answer.trim().length > 0 && (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: '18px 22px',
            marginBottom: 32,
            textAlign: 'left',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-card)',
            animation: 'fadeUp 1s ease 1.2s both',
          }}>
            <p style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--terra)',
              fontWeight: 600,
              marginBottom: 8,
              fontFamily: 'Lora, serif',
            }}>
              Your reflection
            </p>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--brown)',
            }}>
              &ldquo;{answer}&rdquo;
            </p>
          </div>
        )}

        <button
          onClick={handleAnother}
          className="btn btn-secondary"
          style={{
            padding: '12px 22px',
            fontSize: 13,
            marginBottom: 40,
            animation: 'fadeUp 1s ease 1.4s both',
          }}
        >
          ↻ Another moment
        </button>

        <div style={{
          padding: '24px 22px',
          background: 'var(--bg-card)',
          borderRadius: 18,
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-card)',
          animation: 'fadeUp 1s ease 1.6s both',
        }}>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--ink)',
            marginBottom: 8,
            lineHeight: 1.5,
          }}>
            This bloom won&apos;t stay.
          </p>
          <p style={{
            fontSize: 13,
            color: 'var(--brown-m)',
            lineHeight: 1.65,
            marginBottom: 18,
            fontFamily: 'Lora, serif',
          }}>
            When Bloom opens, your garden remembers every reflection. Come back to yourself, day by day.
          </p>
          <a
            href="https://trybloom.co/pricing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSignupClick}
            className="btn btn-primary"
            style={{
              padding: '12px 20px',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Get Bloom when it&apos;s ready →
          </a>
        </div>
      </div>
    </main>
  );
}
