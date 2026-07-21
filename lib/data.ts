// ─── Questions bank (rotates daily) ────────────────────────
export const QUESTIONS = [
  { q: "What's quietly asking for your attention right now?", cat: "awareness" },
  { q: "What small thing brought you joy today?", cat: "gratitude" },
  { q: "When did you last feel truly at peace?", cat: "presence" },
  { q: "What would you do today if you weren't afraid?", cat: "courage" },
  { q: "What's one kind thing you could say to yourself?", cat: "self-compassion" },
  { q: "What energy did you wake up with this morning?", cat: "awareness" },
  { q: "What are you holding onto that you could gently put down?", cat: "release" },
  { q: "Who made you feel seen this week?", cat: "connection" },
  { q: "What's one boundary you want to honor more this week?", cat: "awareness" },
  { q: "If today had a color, what would it be?", cat: "playful" },
  { q: "What made you smile this week?", cat: "the small stuff" },
  { q: "What song describes your mood today?", cat: "right now" },
  { q: "What's the best part of your morning?", cat: "rituals" },
  { q: "Who deserves a text from you today?", cat: "people" },
  { q: "What tiny thing are you looking forward to?", cat: "future" },
  { q: "What did today teach you about yourself?", cat: "reflection" },
  { q: "What are you tolerating that you shouldn't?", cat: "clarity" },
  { q: "What's a small win you can celebrate right now?", cat: "gratitude" },
  { q: "What would 'enough' look like for you today?", cat: "presence" },
  { q: "Who inspires you and why?", cat: "connection" },
];

// ─── Quotes bank (rotates daily) ────────────────────────
export const QUOTES = [
  { text: "The lotus flower blooms most beautifully from the deepest mud.", author: "Buddhist Proverb" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
  { text: "Do not let the behavior of others destroy your inner peace.", author: "Dalai Lama" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You cannot always control what goes on outside. But you can always control what goes on inside.", author: "Wayne Dyer" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", author: "Meister Eckhart" },
  { text: "It's not the mountain we conquer, but ourselves.", author: "Sir Edmund Hillary" },
  { text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", author: "Ralph Marston" },
];

// ─── Utilities ────────────────────────
export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Sweet night";
}

export const FLOWER_COLORS = ['#C17F59', '#D4A574', '#E8C4B8', '#C9A96E', '#8B9E7E', '#B5C7A9', '#F0D5C8'];
