// Curated essential duas, grouped by category. Bundled locally (offline-ready).

export type DuaCategory = {
  id: string;
  titleEn: string;
  titleBn: string;
  icon: string;
};

export type Dua = {
  id: string;
  category: string;
  titleEn: string;
  titleBn: string;
  ar: string;
  tr: string;
  en: string;
  bn: string;
  ref: string;
};

export const DUA_CATEGORIES: DuaCategory[] = [
  { id: "morning-evening", titleEn: "Morning & Evening", titleBn: "সকাল-সন্ধ্যা", icon: "sun" },
  { id: "daily", titleEn: "Daily Life", titleBn: "দৈনন্দিন জীবন", icon: "home" },
  { id: "salah", titleEn: "Prayer & Worship", titleBn: "নামাজ ও ইবাদত", icon: "moon" },
  { id: "distress", titleEn: "Forgiveness & Relief", titleBn: "ক্ষমা ও প্রশান্তি", icon: "heart" },
];

export const DUAS: Dua[] = [
  {
    id: "waking",
    category: "morning-evening",
    titleEn: "On waking up",
    titleBn: "ঘুম থেকে ওঠার দোয়া",
    ar: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ ٱلنُّشُورُ",
    tr: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    en: "All praise is for Allah who gave us life after death, and to Him is the return.",
    bn: "সমস্ত প্রশংসা আল্লাহর, যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁরই কাছে প্রত্যাবর্তন।",
    ref: "Sahih al-Bukhari",
  },
  {
    id: "morning-refuge",
    category: "morning-evening",
    titleEn: "Morning remembrance",
    titleBn: "সকালের জিকির",
    ar: "أَصْبَحْنَا وَأَصْبَحَ ٱلْمُلْكُ لِلَّهِ وَٱلْحَمْدُ لِلَّهِ",
    tr: "Asbahna wa asbahal-mulku lillah, walhamdu lillah",
    en: "We have entered the morning and so has the dominion of Allah; all praise is for Allah.",
    bn: "আমরা সকালে উপনীত হলাম এবং সমস্ত রাজত্ব আল্লাহর জন্য; আর সকল প্রশংসা আল্লাহর।",
    ref: "Sahih Muslim",
  },
  {
    id: "evening-refuge",
    category: "morning-evening",
    titleEn: "Evening remembrance",
    titleBn: "সন্ধ্যার জিকির",
    ar: "أَمْسَيْنَا وَأَمْسَى ٱلْمُلْكُ لِلَّهِ وَٱلْحَمْدُ لِلَّهِ",
    tr: "Amsayna wa amsal-mulku lillah, walhamdu lillah",
    en: "We have entered the evening and so has the dominion of Allah; all praise is for Allah.",
    bn: "আমরা সন্ধ্যায় উপনীত হলাম এবং সমস্ত রাজত্ব আল্লাহর জন্য; আর সকল প্রশংসা আল্লাহর।",
    ref: "Sahih Muslim",
  },
  {
    id: "before-eating",
    category: "daily",
    titleEn: "Before eating",
    titleBn: "খাওয়ার আগে",
    ar: "بِسْمِ ٱللَّهِ",
    tr: "Bismillah",
    en: "In the name of Allah.",
    bn: "আল্লাহর নামে (শুরু করছি)।",
    ref: "Abu Dawud, Tirmidhi",
  },
  {
    id: "after-eating",
    category: "daily",
    titleEn: "After eating",
    titleBn: "খাওয়ার পরে",
    ar: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ",
    tr: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanih",
    en: "All praise is for Allah who fed me this and provided it for me.",
    bn: "সমস্ত প্রশংসা আল্লাহর, যিনি আমাকে এই খাবার খাওয়ালেন এবং তা রিযিক হিসেবে দিলেন।",
    ref: "Abu Dawud, Tirmidhi",
  },
  {
    id: "leaving-home",
    category: "daily",
    titleEn: "Leaving the home",
    titleBn: "ঘর থেকে বের হওয়ার দোয়া",
    ar: "بِسْمِ ٱللَّهِ تَوَكَّلْتُ عَلَى ٱللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ",
    tr: "Bismillahi tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
    en: "In the name of Allah, I place my trust in Allah; there is no might nor power except with Allah.",
    bn: "আল্লাহর নামে, আমি আল্লাহর উপর ভরসা করলাম; আল্লাহ ছাড়া কোনো শক্তি-সামর্থ্য নেই।",
    ref: "Abu Dawud, Tirmidhi",
  },
  {
    id: "travel",
    category: "daily",
    titleEn: "When travelling",
    titleBn: "সফরের দোয়া",
    ar: "سُبْحَانَ ٱلَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    tr: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin",
    en: "Glory to Him who has subjected this to us, and we could never have it (by our efforts).",
    bn: "পবিত্র সেই সত্তা, যিনি এটিকে আমাদের অধীন করে দিয়েছেন, অথচ আমরা একে বশীভূত করতে সক্ষম ছিলাম না।",
    ref: "Sahih Muslim",
  },
  {
    id: "entering-masjid",
    category: "salah",
    titleEn: "Entering the masjid",
    titleBn: "মসজিদে প্রবেশের দোয়া",
    ar: "ٱللَّهُمَّ ٱفْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    tr: "Allahummaf-tah li abwaba rahmatik",
    en: "O Allah, open for me the gates of Your mercy.",
    bn: "হে আল্লাহ, আমার জন্য আপনার রহমতের দরজাসমূহ খুলে দিন।",
    ref: "Sahih Muslim",
  },
  {
    id: "after-adhan",
    category: "salah",
    titleEn: "After the adhan",
    titleBn: "আযানের পরের দোয়া",
    ar: "ٱللَّهُمَّ رَبَّ هَٰذِهِ ٱلدَّعْوَةِ ٱلتَّامَّةِ وَٱلصَّلَاةِ ٱلْقَائِمَةِ",
    tr: "Allahumma rabba hadhihid-da'watit-tammah, was-salatil-qa'imah",
    en: "O Allah, Lord of this perfect call and the prayer to be established…",
    bn: "হে আল্লাহ, এই পরিপূর্ণ আহ্বান ও প্রতিষ্ঠিত নামাজের রব…",
    ref: "Sahih al-Bukhari",
  },
  {
    id: "istighfar",
    category: "distress",
    titleEn: "Seeking forgiveness",
    titleBn: "ইস্তিগফার",
    ar: "أَسْتَغْفِرُ ٱللَّهَ ٱلَّذِي لَا إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    tr: "Astaghfirullahal-ladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh",
    en: "I seek the forgiveness of Allah, there is no deity but He, the Living, the Sustainer, and I repent to Him.",
    bn: "আমি আল্লাহর কাছে ক্ষমা চাই, যিনি ছাড়া কোনো উপাস্য নেই, চিরঞ্জীব, সর্বসত্তার ধারক; এবং আমি তাঁর কাছে তওবা করি।",
    ref: "Abu Dawud, Tirmidhi",
  },
  {
    id: "anxiety",
    category: "distress",
    titleEn: "Relief from anxiety & grief",
    titleBn: "দুশ্চিন্তা ও দুঃখে",
    ar: "ٱللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ ٱلْهَمِّ وَٱلْحَزَنِ",
    tr: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    en: "O Allah, I seek refuge in You from anxiety and grief.",
    bn: "হে আল্লাহ, আমি আপনার কাছে দুশ্চিন্তা ও দুঃখ থেকে আশ্রয় চাই।",
    ref: "Sahih al-Bukhari",
  },
  {
    id: "rabbana-atina",
    category: "distress",
    titleEn: "Good in both worlds",
    titleBn: "উভয় জগতের কল্যাণ",
    ar: "رَبَّنَا آتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ",
    tr: "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-nar",
    en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    bn: "হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দাও এবং আখিরাতেও কল্যাণ দাও, আর আমাদের জাহান্নামের আযাব থেকে রক্ষা করো।",
    ref: "Al-Baqarah 2:201",
  },
];
