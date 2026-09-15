/**
 * TANZIEEM English & Quran Audio Podcasts
 * Strictly official embedded playback from the two requested YouTube playlists.
 * Zero unauthorized scraping or stream ripping.
 */

export interface PodcastEpisode {
  id: string; // YouTube Video ID
  playlistId: string;
  title: string;
  author: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnail: string;
  description: string;
  youtubeUrl: string;
}

export interface PodcastPlaylist {
  id: string;
  playlistId: string;
  title: string;
  titleAr: string;
  subtitle: string;
  author: string;
  category: 'English Learning' | 'Quran Recitation';
  youtubePlaylistUrl: string;
  episodes: PodcastEpisode[];
}

export const PODCAST_PLAYLISTS: PodcastPlaylist[] = [
  {
    id: 'playlist_pod_english',
    playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
    title: 'PodEnglish: English Listening & Speaking Practice',
    titleAr: 'بودكاست الاستماع والمحادثة الإنجليزية اليومية',
    subtitle: 'Improve English Listening While You Organize Your Time',
    author: 'PodEnglish',
    category: 'English Learning',
    youtubePlaylistUrl: 'https://youtube.com/playlist?list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
    episodes: [
      {
        id: 'MZXhexy8Pco',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'Tell Me About Yourself in English | 30-Day Speaking Practice',
        author: 'PodEnglish',
        durationSeconds: 980,
        durationFormatted: '16:20',
        thumbnail: 'https://img.youtube.com/vi/MZXhexy8Pco/hqdefault.jpg',
        description: 'Practice answering the classic interview and conversational prompt "Tell me about yourself" with clear pronunciation and natural pacing.',
        youtubeUrl: 'https://www.youtube.com/watch?v=MZXhexy8Pco&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'n6Y3o6LFU38',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'Speak English in 30 Days — Day 2 | Real-Life English Practice',
        author: 'PodEnglish',
        durationSeconds: 1045,
        durationFormatted: '17:25',
        thumbnail: 'https://img.youtube.com/vi/n6Y3o6LFU38/hqdefault.jpg',
        description: 'Immersive conversational exercise focusing on daily routines, work habits, and time management idioms.',
        youtubeUrl: 'https://www.youtube.com/watch?v=n6Y3o6LFU38&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'iPeBcDzAw-w',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'Speak English in 30 Days — Day 1 | A2–B1 Speaking Practice',
        author: 'PodEnglish',
        durationSeconds: 1110,
        durationFormatted: '18:30',
        thumbnail: 'https://img.youtube.com/vi/iPeBcDzAw-w/hqdefault.jpg',
        description: 'Foundation speaking exercise designed to build sentence cadence, active listening, and spontaneous response reflex.',
        youtubeUrl: 'https://www.youtube.com/watch?v=iPeBcDzAw-w&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'ZQauwG7IMqg',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: '10-Minute Shadowing Practice | Rainy Day Activities & Focus',
        author: 'PodEnglish',
        durationSeconds: 615,
        durationFormatted: '10:15',
        thumbnail: 'https://img.youtube.com/vi/ZQauwG7IMqg/hqdefault.jpg',
        description: 'Shadowing technique to synchronize your speech rate, intonation, and rhythm with native speaker patterns.',
        youtubeUrl: 'https://www.youtube.com/watch?v=ZQauwG7IMqg&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: '4vJ2OPksVks',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: '5 Daily English Habits to Speak Better | Slow Clear English',
        author: 'PodEnglish',
        durationSeconds: 840,
        durationFormatted: '14:00',
        thumbnail: 'https://img.youtube.com/vi/4vJ2OPksVks/hqdefault.jpg',
        description: 'Five atomic habits to incorporate English into your study sessions and daily time blocks without cognitive fatigue.',
        youtubeUrl: 'https://www.youtube.com/watch?v=4vJ2OPksVks&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'eH-1gl-39s4',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'English Listening & Speaking Practice | Real Life Small Talk',
        author: 'PodEnglish',
        durationSeconds: 920,
        durationFormatted: '15:20',
        thumbnail: 'https://img.youtube.com/vi/eH-1gl-39s4/hqdefault.jpg',
        description: 'Master everyday greetings, project status inquiries, and professional pleasantries with ease.',
        youtubeUrl: 'https://www.youtube.com/watch?v=eH-1gl-39s4&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'gN6KtCS8nYg',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'English Shadowing Practice — 28 Questions & Answers',
        author: 'PodEnglish',
        durationSeconds: 1260,
        durationFormatted: '21:00',
        thumbnail: 'https://img.youtube.com/vi/gN6KtCS8nYg/hqdefault.jpg',
        description: 'Interactive question and answer shadowing sprint to hone comprehension and response latency.',
        youtubeUrl: 'https://www.youtube.com/watch?v=gN6KtCS8nYg&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
      {
        id: 'Gw0x2P3lm5g',
        playlistId: 'PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
        title: 'What’s Your English Level? A1–C2 Listening Evaluation',
        author: 'PodEnglish',
        durationSeconds: 1180,
        durationFormatted: '19:40',
        thumbnail: 'https://img.youtube.com/vi/Gw0x2P3lm5g/hqdefault.jpg',
        description: 'Comprehensive 30-question diagnostic listening quiz ranging from beginner A1 to fluent C2 comprehension.',
        youtubeUrl: 'https://www.youtube.com/watch?v=Gw0x2P3lm5g&list=PLc0_DKGuWp_2GK_ZyY81hiV_vdMaUmezE',
      },
    ],
  },
  {
    id: 'playlist_mishary_alafasy',
    playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
    title: 'Sheikh Mishary Rashid Alafasy — Quran Recitations (Ad-Free)',
    titleAr: 'تلاوات الشيخ مشاري راشد العفاسي — المصحف المرتل',
    subtitle: 'Soothing spiritual focus recitations for deep peace and contemplation',
    author: 'الشيخ مشاري راشد العفاسي',
    category: 'Quran Recitation',
    youtubePlaylistUrl: 'https://youtube.com/playlist?list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
    episodes: [
      {
        id: 'KWdjhyG9zn8',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '001 | سورة الفاتحة | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 85,
        durationFormatted: '01:25',
        thumbnail: 'https://img.youtube.com/vi/KWdjhyG9zn8/hqdefault.jpg',
        description: 'سورة الفاتحة بصوت الشيخ مشاري راشد العفاسي تلاوة خاشعة مرقعة بجودة عالية.',
        youtubeUrl: 'https://www.youtube.com/watch?v=KWdjhyG9zn8&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: 'b0WqGEPnpaM',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '002 | سورة البقرة | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 7420,
        durationFormatted: '02:03:40',
        thumbnail: 'https://img.youtube.com/vi/b0WqGEPnpaM/hqdefault.jpg',
        description: 'سورة البقرة كاملة بصوت عذب نقي تدفع الشياطين وتجلب البركة والسكينة.',
        youtubeUrl: 'https://www.youtube.com/watch?v=b0WqGEPnpaM&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: 'dXQ2iFkRb4A',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '003 | سورة آل عمران | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 4680,
        durationFormatted: '01:18:00',
        thumbnail: 'https://img.youtube.com/vi/dXQ2iFkRb4A/hqdefault.jpg',
        description: 'سورة آل عمران تلاوة مرتلة تهز القلوب وترسخ اليقين.',
        youtubeUrl: 'https://www.youtube.com/watch?v=dXQ2iFkRb4A&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: 'gXlT3E9ATQw',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '004 | سورة النساء | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 5120,
        durationFormatted: '01:25:20',
        thumbnail: 'https://img.youtube.com/vi/gXlT3E9ATQw/hqdefault.jpg',
        description: 'سورة النساء بصوت الشيخ مشاري راشد العفاسي نقية دون إعلانات.',
        youtubeUrl: 'https://www.youtube.com/watch?v=gXlT3E9ATQw&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: 'dAJUyTRx9Ys',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '005 | سورة المائدة | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 3840,
        durationFormatted: '01:04:00',
        thumbnail: 'https://img.youtube.com/vi/dAJUyTRx9Ys/hqdefault.jpg',
        description: 'سورة المائدة مرتلة بأداء عذب يبعث على التأمل والانضباط الروحي.',
        youtubeUrl: 'https://www.youtube.com/watch?v=dAJUyTRx9Ys&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: 'vYSflRIcYUQ',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '006 | سورة الأنعام | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 4320,
        durationFormatted: '01:12:00',
        thumbnail: 'https://img.youtube.com/vi/vYSflRIcYUQ/hqdefault.jpg',
        description: 'سورة الأنعام بصوت الشيخ مشاري العفاسي تلاوة تحث على توحيد الله وتدبر خلقه.',
        youtubeUrl: 'https://www.youtube.com/watch?v=vYSflRIcYUQ&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
      {
        id: '6BfPYOGaX0I',
        playlistId: 'PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
        title: '007 | سورة الأعراف | الشيخ مشاري العفاسي',
        author: 'الشيخ مشاري العفاسي',
        durationSeconds: 4980,
        durationFormatted: '01:23:00',
        thumbnail: 'https://img.youtube.com/vi/6BfPYOGaX0I/hqdefault.jpg',
        description: 'سورة الأعراف تلاوة مهيبة ومؤثرة للشيخ مشاري العفاسي.',
        youtubeUrl: 'https://www.youtube.com/watch?v=6BfPYOGaX0I&list=PLziRdBgoOn2nFE-jJFlE3WYCWux--TUsT',
      },
    ],
  },
];
