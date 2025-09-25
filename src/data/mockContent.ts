import { Story } from "@/types/index";

export interface Category {
  id: string;
  title: string;
  description?: string;
  storyIds: string[];
}

export interface Episode {
  id: string;
  storyId: string;
  title: string;
  duration: string;
  listens: string;
  premium?: boolean;
}

export const stories: Story[] = [
  {
    id: "forbidden-desire",
    title: "Forbidden Desire: One Year To Love",
    author: "Amelia Hayes",
    description:
      "With one year left to live, Abigail pursues cold-hearted billionaire Quentin Blackwood, determined to experience love before she dies. As she enters his dangerous world, Abigail must navigate growing passion and protect her heart while the clock ticks down on her life.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["romance", "drama"],
    isPremium: true,
    durationMinutes: 32,
  },
  {
    id: "handsome-bodyguard",
    title: "My Handsome Bodyguard",
    author: "Lucas Grant",
    description: "A determined CEO hires a mysterious bodyguard who hides a past that could shatter their worlds.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["thriller", "romance"],
    isPremium: true,
    durationMinutes: 29,
  },
  {
    id: "memory-hack",
    title: "Memory Hack",
    author: "Zoe Walters",
    description: "An investigative journalist discovers an underground clinic that lets clients rewrite the past.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["sci-fi", "mystery"],
    isPremium: false,
    durationMinutes: 24,
  },
  {
    id: "secrets-of-serenity",
    title: "Secrets of Serenity Brook",
    author: "Evelyn Cho",
    description: "Two rival families in a quiet seaside town unravel a long-buried conspiracy.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["mystery"],
    isPremium: false,
    durationMinutes: 26,
  },
  {
    id: "alpha-heir",
    title: "Alpha Heir",
    author: "Jace Sinclair",
    description: "A runaway shifter princess returns to claim her throne and the mate she left behind.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1521579971123-1192931a1452?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["fantasy"],
    isPremium: true,
    durationMinutes: 31,
  },
  {
    id: "love-in-the-storm",
    title: "Love in the Storm",
    author: "Isabella Reed",
    description: "Stranded during a typhoon, two enemies must rely on each other to make it out alive.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1525181261060-3a983f9d1781?auto=format&fit=crop&w=800&q=80",
    audioUrl: "#",
    tags: ["romance", "adventure"],
    isPremium: false,
    durationMinutes: 27,
  },
];

export const categories: Category[] = [
  {
    id: "dangerous-attractions",
    title: "Dangerous Attractions",
    storyIds: ["handsome-bodyguard", "forbidden-desire", "alpha-heir", "love-in-the-storm"],
  },
  {
    id: "unlock-your-mind",
    title: "Unlock Your Mind Today",
    storyIds: ["memory-hack", "secrets-of-serenity", "love-in-the-storm"],
  },
  {
    id: "dark-obsessions",
    title: "Dark Obsessions",
    storyIds: ["forbidden-desire", "handsome-bodyguard", "alpha-heir"],
  },
  {
    id: "new-releases",
    title: "New Releases",
    storyIds: ["memory-hack", "alpha-heir", "secrets-of-serenity"],
  },
];

export const episodes: Episode[] = [
  {
    id: "ep1",
    storyId: "forbidden-desire",
    title: "Episode 1 - Listening Now",
    duration: "10 min 26 sec",
    listens: "6K+",
  },
  {
    id: "ep2",
    storyId: "forbidden-desire",
    title: "Episode 2 - Collision Course",
    duration: "9 min 44 sec",
    listens: "5K+",
  },
  {
    id: "ep3",
    storyId: "forbidden-desire",
    title: "Episode 3 - Shattered Promises",
    duration: "8 min 12 sec",
    listens: "3K+",
  },
  {
    id: "ep4",
    storyId: "forbidden-desire",
    title: "Episode 4 - The Deal",
    duration: "7 min 48 sec",
    listens: "2K+",
  },
  {
    id: "ep5",
    storyId: "forbidden-desire",
    title: "Episode 5 - Midnight Confessions",
    duration: "7 min 32 sec",
    listens: "1.5K+",
    premium: true,
  },
];