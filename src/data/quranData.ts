/**
 * Holy Quran Canonical Metadata & Recitation Configuration
 * All 114 Surahs with verified metadata and legal recitation audio by Sheikh Mishary Rashid Alafasy.
 */

export interface SurahMeta {
  number: number;
  nameAr: string;
  nameEn: string;
  translationEn: string;
  totalAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export const QURAN_ATTRIBUTION = {
  reciter: 'الشيخ مشاري راشد العفاسي (Sheikh Mishary Rashid Alafasy)',
  source: 'QuranicAudio.com / MP3Quran.net Open CDN (Public Distribution)',
  license: 'Public Islamic Educational Audio Distribution',
};

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', translationEn: 'The Opening', totalAyahs: 7, revelationType: 'Meccan' },
  { number: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', translationEn: 'The Cow', totalAyahs: 286, revelationType: 'Medinan' },
  { number: 3, nameAr: 'آل عمران', nameEn: 'Ali \'Imran', translationEn: 'Family of Imran', totalAyahs: 200, revelationType: 'Medinan' },
  { number: 4, nameAr: 'النساء', nameEn: 'An-Nisa', translationEn: 'The Women', totalAyahs: 176, revelationType: 'Medinan' },
  { number: 5, nameAr: 'المائدة', nameEn: 'Al-Ma\'idah', translationEn: 'The Table Spread', totalAyahs: 120, revelationType: 'Medinan' },
  { number: 6, nameAr: 'الأنعام', nameEn: 'Al-An\'am', translationEn: 'The Cattle', totalAyahs: 165, revelationType: 'Meccan' },
  { number: 7, nameAr: 'الأعراف', nameEn: 'Al-A\'raf', translationEn: 'The Heights', totalAyahs: 206, revelationType: 'Meccan' },
  { number: 8, nameAr: 'الأنفال', nameEn: 'Al-Anfal', translationEn: 'The Spoils of War', totalAyahs: 75, revelationType: 'Medinan' },
  { number: 9, nameAr: 'التوبة', nameEn: 'At-Tawbah', translationEn: 'The Repentance', totalAyahs: 129, revelationType: 'Medinan' },
  { number: 10, nameAr: 'يونس', nameEn: 'Yunus', translationEn: 'Jonah', totalAyahs: 109, revelationType: 'Meccan' },
  { number: 11, nameAr: 'هود', nameEn: 'Hud', translationEn: 'Hud', totalAyahs: 123, revelationType: 'Meccan' },
  { number: 12, nameAr: 'يوسف', nameEn: 'Yusuf', translationEn: 'Joseph', totalAyahs: 111, revelationType: 'Meccan' },
  { number: 13, nameAr: 'الرعد', nameEn: 'Ar-Ra\'d', translationEn: 'The Thunder', totalAyahs: 43, revelationType: 'Medinan' },
  { number: 14, nameAr: 'ابراهيم', nameEn: 'Ibrahim', translationEn: 'Abraham', totalAyahs: 52, revelationType: 'Meccan' },
  { number: 15, nameAr: 'الحجر', nameEn: 'Al-Hijr', translationEn: 'The Rocky Tract', totalAyahs: 99, revelationType: 'Meccan' },
  { number: 16, nameAr: 'النحل', nameEn: 'An-Nahl', translationEn: 'The Bee', totalAyahs: 128, revelationType: 'Meccan' },
  { number: 17, nameAr: 'الإسراء', nameEn: 'Al-Isra', translationEn: 'The Night Journey', totalAyahs: 111, revelationType: 'Meccan' },
  { number: 18, nameAr: 'الكهف', nameEn: 'Al-Kahf', translationEn: 'The Cave', totalAyahs: 110, revelationType: 'Meccan' },
  { number: 19, nameAr: 'مريم', nameEn: 'Maryam', translationEn: 'Mary', totalAyahs: 98, revelationType: 'Meccan' },
  { number: 20, nameAr: 'طه', nameEn: 'Ta-Ha', translationEn: 'Ta-Ha', totalAyahs: 135, revelationType: 'Meccan' },
  { number: 21, nameAr: 'الأنبياء', nameEn: 'Al-Anbiya', translationEn: 'The Prophets', totalAyahs: 112, revelationType: 'Meccan' },
  { number: 22, nameAr: 'الحج', nameEn: 'Al-Hajj', translationEn: 'The Pilgrimage', totalAyahs: 78, revelationType: 'Medinan' },
  { number: 23, nameAr: 'المؤمنون', nameEn: 'Al-Mu\'minun', translationEn: 'The Believers', totalAyahs: 118, revelationType: 'Meccan' },
  { number: 24, nameAr: 'النور', nameEn: 'An-Nur', translationEn: 'The Light', totalAyahs: 64, revelationType: 'Medinan' },
  { number: 25, nameAr: 'الفرقان', nameEn: 'Al-Furqan', translationEn: 'The Criterion', totalAyahs: 77, revelationType: 'Meccan' },
  { number: 26, nameAr: 'الشعراء', nameEn: 'Ash-Shu\'ara', translationEn: 'The Poets', totalAyahs: 227, revelationType: 'Meccan' },
  { number: 27, nameAr: 'النمل', nameEn: 'An-Naml', translationEn: 'The Ant', totalAyahs: 93, revelationType: 'Meccan' },
  { number: 28, nameAr: 'القصص', nameEn: 'Al-Qasas', translationEn: 'The Stories', totalAyahs: 88, revelationType: 'Meccan' },
  { number: 29, nameAr: 'العنكبوت', nameEn: 'Al-\'Ankabut', translationEn: 'The Spider', totalAyahs: 69, revelationType: 'Meccan' },
  { number: 30, nameAr: 'الروم', nameEn: 'Ar-Rum', translationEn: 'The Romans', totalAyahs: 60, revelationType: 'Meccan' },
  { number: 31, nameAr: 'لقمان', nameEn: 'Luqman', translationEn: 'Luqman', totalAyahs: 34, revelationType: 'Meccan' },
  { number: 32, nameAr: 'السجدة', nameEn: 'As-Sajdah', translationEn: 'The Prostration', totalAyahs: 30, revelationType: 'Meccan' },
  { number: 33, nameAr: 'الأحزاب', nameEn: 'Al-Ahzab', translationEn: 'The Combined Forces', totalAyahs: 73, revelationType: 'Medinan' },
  { number: 34, nameAr: 'سبإ', nameEn: 'Saba', translationEn: 'Sheba', totalAyahs: 54, revelationType: 'Meccan' },
  { number: 35, nameAr: 'فاطر', nameEn: 'Fatir', translationEn: 'Originator', totalAyahs: 45, revelationType: 'Meccan' },
  { number: 36, nameAr: 'يس', nameEn: 'Ya-Sin', translationEn: 'Ya-Sin', totalAyahs: 83, revelationType: 'Meccan' },
  { number: 37, nameAr: 'الصافات', nameEn: 'As-Saffat', translationEn: 'Those who set the Ranks', totalAyahs: 182, revelationType: 'Meccan' },
  { number: 38, nameAr: 'ص', nameEn: 'Sad', translationEn: 'The Letter "Saad"', totalAyahs: 88, revelationType: 'Meccan' },
  { number: 39, nameAr: 'الزمر', nameEn: 'Az-Zumar', translationEn: 'The Troops', totalAyahs: 75, revelationType: 'Meccan' },
  { number: 40, nameAr: 'غافر', nameEn: 'Ghafir', translationEn: 'The Forgiver', totalAyahs: 85, revelationType: 'Meccan' },
  { number: 41, nameAr: 'فصلت', nameEn: 'Fussilat', translationEn: 'Explained in Detail', totalAyahs: 54, revelationType: 'Meccan' },
  { number: 42, nameAr: 'الشورى', nameEn: 'Ash-Shura', translationEn: 'The Consultation', totalAyahs: 53, revelationType: 'Meccan' },
  { number: 43, nameAr: 'الزخرف', nameEn: 'Az-Zukhruf', translationEn: 'The Ornaments of Gold', totalAyahs: 89, revelationType: 'Meccan' },
  { number: 44, nameAr: 'الدخان', nameEn: 'Ad-Dukhan', translationEn: 'The Smoke', totalAyahs: 59, revelationType: 'Meccan' },
  { number: 45, nameAr: 'الجاثية', nameEn: 'Al-Jathiyah', translationEn: 'The Crouching', totalAyahs: 37, revelationType: 'Meccan' },
  { number: 46, nameAr: 'الأحقاف', nameEn: 'Al-Ahqaf', translationEn: 'The Wind-Curved Sandhills', totalAyahs: 35, revelationType: 'Meccan' },
  { number: 47, nameAr: 'محمد', nameEn: 'Muhammad', translationEn: 'Muhammad', totalAyahs: 38, revelationType: 'Medinan' },
  { number: 48, nameAr: 'الفتح', nameEn: 'Al-Fath', translationEn: 'The Victory', totalAyahs: 29, revelationType: 'Medinan' },
  { number: 49, nameAr: 'الحجرات', nameEn: 'Al-Hujurat', translationEn: 'The Rooms', totalAyahs: 18, revelationType: 'Medinan' },
  { number: 50, nameAr: 'ق', nameEn: 'Qaf', translationEn: 'The Letter "Qaf"', totalAyahs: 45, revelationType: 'Meccan' },
  { number: 51, nameAr: 'الذاريات', nameEn: 'Adh-Dhariyat', translationEn: 'The Winnowing Winds', totalAyahs: 60, revelationType: 'Meccan' },
  { number: 52, nameAr: 'الطور', nameEn: 'At-Tur', translationEn: 'The Mount', totalAyahs: 49, revelationType: 'Meccan' },
  { number: 53, nameAr: 'النجم', nameEn: 'An-Najm', translationEn: 'The Star', totalAyahs: 62, revelationType: 'Meccan' },
  { number: 54, nameAr: 'القمر', nameEn: 'Al-Qamar', translationEn: 'The Moon', totalAyahs: 55, revelationType: 'Meccan' },
  { number: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', translationEn: 'The Beneficent', totalAyahs: 78, revelationType: 'Medinan' },
  { number: 56, nameAr: 'الواقعة', nameEn: 'Al-Waqi\'ah', translationEn: 'The Inevitable', totalAyahs: 96, revelationType: 'Meccan' },
  { number: 57, nameAr: 'الحديد', nameEn: 'Al-Hadid', translationEn: 'The Iron', totalAyahs: 29, revelationType: 'Medinan' },
  { number: 58, nameAr: 'المجادلة', nameEn: 'Al-Mujadila', translationEn: 'The Pleading Woman', totalAyahs: 22, revelationType: 'Medinan' },
  { number: 59, nameAr: 'الحشر', nameEn: 'Al-Hashr', translationEn: 'The Exile', totalAyahs: 24, revelationType: 'Medinan' },
  { number: 60, nameAr: 'الممتحنة', nameEn: 'Al-Mumtahanah', translationEn: 'She that is to be examined', totalAyahs: 13, revelationType: 'Medinan' },
  { number: 61, nameAr: 'الصف', nameEn: 'As-Saf', translationEn: 'The Ranks', totalAyahs: 14, revelationType: 'Medinan' },
  { number: 62, nameAr: 'الجمعة', nameEn: 'Al-Jumu\'ah', translationEn: 'The Congregation', totalAyahs: 11, revelationType: 'Medinan' },
  { number: 63, nameAr: 'المنافقون', nameEn: 'Al-Munafiqun', translationEn: 'The Hypocrites', totalAyahs: 11, revelationType: 'Medinan' },
  { number: 64, nameAr: 'التغابن', nameEn: 'At-Taghabun', translationEn: 'The Mutual Disillusion', totalAyahs: 18, revelationType: 'Medinan' },
  { number: 65, nameAr: 'الطلاق', nameEn: 'At-Talaq', translationEn: 'The Divorce', totalAyahs: 12, revelationType: 'Medinan' },
  { number: 66, nameAr: 'التحريم', nameEn: 'At-Tahrim', translationEn: 'The Prohibition', totalAyahs: 12, revelationType: 'Medinan' },
  { number: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', translationEn: 'The Sovereignty', totalAyahs: 30, revelationType: 'Meccan' },
  { number: 68, nameAr: 'القلم', nameEn: 'Al-Qalam', translationEn: 'The Pen', totalAyahs: 52, revelationType: 'Meccan' },
  { number: 69, nameAr: 'الحاقة', nameEn: 'Al-Haqqah', translationEn: 'The Reality', totalAyahs: 52, revelationType: 'Meccan' },
  { number: 70, nameAr: 'المعارج', nameEn: 'Al-Ma\'arij', translationEn: 'The Ascending Stairways', totalAyahs: 44, revelationType: 'Meccan' },
  { number: 71, nameAr: 'نوح', nameEn: 'Nuh', translationEn: 'Noah', totalAyahs: 28, revelationType: 'Meccan' },
  { number: 72, nameAr: 'الجن', nameEn: 'Al-Jinn', translationEn: 'The Jinn', totalAyahs: 28, revelationType: 'Meccan' },
  { number: 73, nameAr: 'المزمل', nameEn: 'Al-Muzzammil', translationEn: 'The Enshrouded One', totalAyahs: 20, revelationType: 'Meccan' },
  { number: 74, nameAr: 'المدثر', nameEn: 'Al-Muddaththir', translationEn: 'The Cloaked One', totalAyahs: 56, revelationType: 'Meccan' },
  { number: 75, nameAr: 'القيامة', nameEn: 'Al-Qiyamah', translationEn: 'The Resurrection', totalAyahs: 40, revelationType: 'Meccan' },
  { number: 76, nameAr: 'الإنسان', nameEn: 'Al-Insan', translationEn: 'The Human', totalAyahs: 31, revelationType: 'Medinan' },
  { number: 77, nameAr: 'المرسلات', nameEn: 'Al-Mursalat', translationEn: 'The Emissaries', totalAyahs: 50, revelationType: 'Meccan' },
  { number: 78, nameAr: 'النبإ', nameEn: 'An-Naba', translationEn: 'The Tidings', totalAyahs: 40, revelationType: 'Meccan' },
  { number: 79, nameAr: 'النازعات', nameEn: 'An-Nazi\'at', translationEn: 'Those who drag forth', totalAyahs: 46, revelationType: 'Meccan' },
  { number: 80, nameAr: 'عبس', nameEn: '\'Abasa', translationEn: 'He frowned', totalAyahs: 42, revelationType: 'Meccan' },
  { number: 81, nameAr: 'التكوير', nameEn: 'At-Takwir', translationEn: 'The Overthrowing', totalAyahs: 29, revelationType: 'Meccan' },
  { number: 82, nameAr: 'الانفطار', nameEn: 'Al-Infitar', translationEn: 'The Cleaving', totalAyahs: 19, revelationType: 'Meccan' },
  { number: 83, nameAr: 'المطففين', nameEn: 'Al-Mutaffifin', translationEn: 'The Defrauding', totalAyahs: 36, revelationType: 'Meccan' },
  { number: 84, nameAr: 'الانشقاق', nameEn: 'Al-Inshiqaq', translationEn: 'The Splitting Open', totalAyahs: 25, revelationType: 'Meccan' },
  { number: 85, nameAr: 'البروج', nameEn: 'Al-Buruj', translationEn: 'The Mansions of the Stars', totalAyahs: 22, revelationType: 'Meccan' },
  { number: 86, nameAr: 'الطارق', nameEn: 'At-Tariq', translationEn: 'The Morning Star', totalAyahs: 17, revelationType: 'Meccan' },
  { number: 87, nameAr: 'الأعلى', nameEn: 'Al-A\'la', translationEn: 'The Most High', totalAyahs: 19, revelationType: 'Meccan' },
  { number: 88, nameAr: 'الغاشية', nameEn: 'Al-Ghashiyah', translationEn: 'The Overwhelming', totalAyahs: 26, revelationType: 'Meccan' },
  { number: 89, nameAr: 'الفجر', nameEn: 'Al-Fajr', translationEn: 'The Dawn', totalAyahs: 30, revelationType: 'Meccan' },
  { number: 90, nameAr: 'البلد', nameEn: 'Al-Balad', translationEn: 'The City', totalAyahs: 20, revelationType: 'Meccan' },
  { number: 91, nameAr: 'الشمس', nameEn: 'Ash-Shams', translationEn: 'The Sun', totalAyahs: 15, revelationType: 'Meccan' },
  { number: 92, nameAr: 'الليل', nameEn: 'Al-Layl', translationEn: 'The Night', totalAyahs: 21, revelationType: 'Meccan' },
  { number: 93, nameAr: 'الضحى', nameEn: 'Ad-Duhaa', translationEn: 'The Morning Hours', totalAyahs: 11, revelationType: 'Meccan' },
  { number: 94, nameAr: 'الشرح', nameEn: 'Ash-Sharh', translationEn: 'The Relief', totalAyahs: 8, revelationType: 'Meccan' },
  { number: 95, nameAr: 'التين', nameEn: 'At-Tin', translationEn: 'The Fig', totalAyahs: 8, revelationType: 'Meccan' },
  { number: 96, nameAr: 'العلق', nameEn: 'Al-\'Alaq', translationEn: 'The Clot', totalAyahs: 19, revelationType: 'Meccan' },
  { number: 97, nameAr: 'القدر', nameEn: 'Al-Qadr', translationEn: 'The Power', totalAyahs: 5, revelationType: 'Meccan' },
  { number: 98, nameAr: 'البينة', nameEn: 'Al-Bayyinah', translationEn: 'The Clear Proof', totalAyahs: 8, revelationType: 'Medinan' },
  { number: 99, nameAr: 'الزلزلة', nameEn: 'Az-Zalzalah', translationEn: 'The Earthquake', totalAyahs: 8, revelationType: 'Medinan' },
  { number: 100, nameAr: 'العاديات', nameEn: 'Al-\'Adiyat', translationEn: 'The Courser', totalAyahs: 11, revelationType: 'Meccan' },
  { number: 101, nameAr: 'القارعة', nameEn: 'Al-Qari\'ah', translationEn: 'The Calamity', totalAyahs: 11, revelationType: 'Meccan' },
  { number: 102, nameAr: 'التكاثر', nameEn: 'At-Takathur', translationEn: 'The Rivalry in World Increase', totalAyahs: 8, revelationType: 'Meccan' },
  { number: 103, nameAr: 'العصر', nameEn: 'Al-\'Asr', translationEn: 'The Declining Day', totalAyahs: 3, revelationType: 'Meccan' },
  { number: 104, nameAr: 'الهمزة', nameEn: 'Al-Humazah', translationEn: 'The Traducer', totalAyahs: 9, revelationType: 'Meccan' },
  { number: 105, nameAr: 'الفيل', nameEn: 'Al-Fil', translationEn: 'The Elephant', totalAyahs: 5, revelationType: 'Meccan' },
  { number: 106, nameAr: 'قريش', nameEn: 'Quraysh', translationEn: 'Quraysh', totalAyahs: 4, revelationType: 'Meccan' },
  { number: 107, nameAr: 'الماعون', nameEn: 'Al-Ma\'un', translationEn: 'The Small Kindness', totalAyahs: 7, revelationType: 'Meccan' },
  { number: 108, nameAr: 'الكوثر', nameEn: 'Al-Kawthar', translationEn: 'The Abundance', totalAyahs: 3, revelationType: 'Meccan' },
  { number: 109, nameAr: 'الكافرون', nameEn: 'Al-Kafirun', translationEn: 'The Disbelievers', totalAyahs: 6, revelationType: 'Meccan' },
  { number: 110, nameAr: 'النصر', nameEn: 'An-Nasr', translationEn: 'The Divine Support', totalAyahs: 3, revelationType: 'Medinan' },
  { number: 111, nameAr: 'المسد', nameEn: 'Al-Masad', translationEn: 'The Palm Fiber', totalAyahs: 5, revelationType: 'Meccan' },
  { number: 112, nameAr: 'الإخلاص', nameEn: 'Al-Ikhlas', translationEn: 'The Sincerity', totalAyahs: 4, revelationType: 'Meccan' },
  { number: 113, nameAr: 'الفلق', nameEn: 'Al-Falaq', translationEn: 'The Daybreak', totalAyahs: 5, revelationType: 'Meccan' },
  { number: 114, nameAr: 'الناس', nameEn: 'An-Nas', translationEn: 'Mankind', totalAyahs: 6, revelationType: 'Meccan' },
];

/**
 * Get verified high-quality legal stream URL for Sheikh Mishary Rashid Alafasy.
 * Default legal CDN: download.quranicaudio.com (public Islamic audio archive)
 */
export function getSurahAudioUrl(surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  // Use public legal streaming CDN for Mishary Alafasy
  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${padded}.mp3`;
}
