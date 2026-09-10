// Terms & Conditions + Privacy Policy copy for Hidayah (EN/BN).
//
// Self-contained so it doesn't bloat lib/translations.ts. Rendered by
// components/LegalPage.tsx, picked by the current language.
//
// NOTE: Conventional, good-faith legal copy - NOT lawyer-reviewed. Fill the
// [PLACEHOLDER]s and have counsel review (incl. BTRC / carrier value-added
// service compliance and the Bangla translation) before publishing.

import type { Lang } from "@/lib/translations";

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED_EN = "26 June 2026";
const LAST_UPDATED_BN = "২৬ জুন ২০২৬";

// ── Fill these in before publishing ──────────────────────────────────────────
const COMPANY = "[COMPANY LEGAL NAME]";
const CONTACT = "[support@hidayah.example]";
const CHARGE = "[the subscription charge shown at activation, incl. applicable VAT + SD + SC]";
const CHARGE_BN = "[সক্রিয়করণের সময় প্রদর্শিত সাবস্ক্রিপশন চার্জ, প্রযোজ্য VAT + SD + SC সহ]";

const en: { terms: LegalDoc; privacy: LegalDoc } = {
  terms: {
    title: "Terms & Conditions",
    updated: `Last updated: ${LAST_UPDATED_EN}`,
    intro:
      `Welcome to Hidayah ("the Service"), an Islamic companion app offering prayer times, qibla direction, the Noble Quran, duas, the 99 Names, tasbih, the Hijri calendar and hadith, operated by ${COMPANY} for Robi and Airtel subscribers. By subscribing to or using the Service, you agree to these Terms & Conditions. If you do not agree, please do not use the Service.`,
    sections: [
      {
        heading: "1. Eligibility",
        body: [
          "The Service is available to active Robi and Airtel mobile subscribers in Bangladesh.",
          "You must be at least 18 years old, or use the Service under the supervision and consent of a parent or legal guardian. By using the Service you confirm that the mobile number you register belongs to you.",
        ],
      },
      {
        heading: "2. The Service",
        body: [
          "Hidayah provides prayer times, a qibla compass, the Noble Quran with translations and audio, duas, the 99 Names, a tasbih counter, the Hijri calendar, hadith, and related features in Bangla and English.",
          "Access to premium features requires an active subscription. Features may be added, changed, or removed at any time.",
        ],
      },
      {
        heading: "3. Subscription & Charges",
        body: [
          `Premium access is provided through a carrier-billed subscription. By subscribing you authorise your mobile operator to charge ${CHARGE} to your account.`,
          "The subscription renews automatically each billing cycle until you cancel. Charges are collected by your mobile operator and its billing aggregator, not directly by us.",
        ],
      },
      {
        heading: "4. Authentication & Your Account",
        body: [
          "You sign in with your mobile number and a one-time password (OTP) sent by SMS. You are responsible for keeping your device and OTP secure.",
          "One account is permitted per mobile number.",
        ],
      },
      {
        heading: "5. Religious Content & Accuracy",
        body: [
          "Prayer times are calculated from your location and standard calculation methods and are provided for convenience only; they may differ slightly from your local mosque or authority. The qibla direction is an approximation based on your device's sensors and location.",
          "Quran text, translations, audio recitations, and hadith are sourced from third-party providers. While we strive for accuracy, we do not guarantee that all content is free of error. The Service is an aid to worship and is not a substitute for qualified scholarly guidance.",
        ],
      },
      {
        heading: "6. Location & Permissions",
        body: [
          "Some features (prayer times, qibla) work best with access to your approximate location. You can use the Service without granting location access, with reduced accuracy. You may control permissions through your device settings.",
        ],
      },
      {
        heading: "7. Cancellation & Unsubscribe",
        body: [
          "You may cancel at any time using the Unsubscribe option in the Service, or by following your mobile operator's unsubscribe instructions for this service.",
          "Cancellation stops future charges. Your premium access continues until the end of the current billing cycle.",
        ],
      },
      {
        heading: "8. Refunds",
        body: [
          "Subscription charges are generally non-refundable except where a refund is required by applicable law or by your mobile operator's policy.",
        ],
      },
      {
        heading: "9. Acceptable Use",
        body: [
          "You agree to use the Service respectfully and lawfully, and not to misuse, copy, redistribute, disrupt, or reverse-engineer the Service or its content.",
        ],
      },
      {
        heading: "10. Intellectual Property & Third-Party Content",
        body: [
          `The app, its design, and software are owned by ${COMPANY} or its licensors. Quran text and translations, hadith collections, prayer-time data, and similar content are provided by their respective rights holders and remain their property.`,
        ],
      },
      {
        heading: "11. Disclaimers & Limitation of Liability",
        body: [
          'The Service is provided "as is" and "as available" without warranties of any kind, including as to the accuracy of religious content, prayer times, or qibla direction.',
          "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of, or reliance on, the Service.",
        ],
      },
      {
        heading: "12. Changes to These Terms",
        body: [
          "We may update these Terms or the Service from time to time. Material changes will be reflected by the 'Last updated' date above. Your continued use after changes take effect constitutes acceptance.",
        ],
      },
      {
        heading: "13. Governing Law",
        body: [
          "These Terms are governed by the laws of Bangladesh, and any disputes are subject to the exclusive jurisdiction of the competent courts of Bangladesh.",
        ],
      },
      {
        heading: "14. Contact",
        body: [`For questions about these Terms, contact us at ${CONTACT}.`],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: `Last updated: ${LAST_UPDATED_EN}`,
    intro:
      `This Privacy Policy explains how ${COMPANY} collects, uses, and protects your information when you use Hidayah. By using the Service, you consent to the practices described here.`,
    sections: [
      {
        heading: "1. Information We Collect",
        body: [
          "Account data: your mobile number and authentication (OTP) logs.",
          "Your preferences and saved data: such as bookmarks, prayer log, Quran reading progress (khatm), and reader settings, which may be synced across your devices.",
          "Location: your approximate location, only if you grant permission, to calculate prayer times and qibla direction.",
          "Technical data: device and usage information collected automatically, such as app/browser type and approximate activity times.",
        ],
      },
      {
        heading: "2. How We Use Your Information",
        body: [
          "To operate the Service, verify your number, calculate prayer times and qibla, sync your saved data across devices, provide support, prevent fraud, and comply with legal obligations.",
        ],
      },
      {
        heading: "3. Carrier Billing",
        body: [
          "Your subscription is billed by your mobile operator. To enable this, your mobile number is shared with the operator and its billing aggregator for charging and subscription management.",
        ],
      },
      {
        heading: "4. Third-Party Content Providers",
        body: [
          "To show Quran text, translations, audio, hadith, and prayer-time data, the app may request content from third-party providers. Your use of such content is also subject to those providers' terms.",
        ],
      },
      {
        heading: "5. How We Share Information",
        body: [
          "We share information with mobile operators and billing aggregators, and with service providers who help us run the Service, and with authorities where required by law.",
          "We do not sell your personal information.",
        ],
      },
      {
        heading: "6. Cookies & Local Storage",
        body: [
          "We use local storage and similar technologies to keep you signed in, cache content for offline use, and remember preferences such as your language and theme.",
        ],
      },
      {
        heading: "7. Data Retention",
        body: [
          "We retain your information for as long as your account is active and as needed to provide the Service, resolve disputes, and meet legal requirements.",
        ],
      },
      {
        heading: "8. Security",
        body: [
          "We use reasonable technical and organisational measures to protect your information. However, no method of transmission or storage is completely secure.",
        ],
      },
      {
        heading: "9. Your Rights",
        body: [
          "Subject to applicable law, you may request access to, correction of, or deletion of your personal information, and you may unsubscribe at any time. Contact us using the details below.",
        ],
      },
      {
        heading: "10. Children",
        body: [
          "The Service is not directed to children under 18 and we do not knowingly collect their personal information.",
        ],
      },
      {
        heading: "11. Changes to This Policy",
        body: [
          "We may update this Policy from time to time. Changes are indicated by the 'Last updated' date above.",
        ],
      },
      {
        heading: "12. Contact",
        body: [`For privacy questions or requests, contact us at ${CONTACT}.`],
      },
    ],
  },
};

const bn: { terms: LegalDoc; privacy: LegalDoc } = {
  terms: {
    title: "শর্তাবলী",
    updated: `সর্বশেষ হালনাগাদ: ${LAST_UPDATED_BN}`,
    intro:
      `Hidayah ("সেবা")-তে স্বাগতম। এটি নামাজের সময়, কিবলা দিকনির্দেশ, পবিত্র কুরআন, দোয়া, ৯৯ নাম, তাসবিহ, হিজরি ক্যালেন্ডার ও হাদিস সম্বলিত একটি ইসলামিক সঙ্গী অ্যাপ, যা রবি ও এয়ারটেল গ্রাহকদের জন্য ${COMPANY} পরিচালনা করে। সেবাটি সাবস্ক্রাইব বা ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। সম্মত না হলে অনুগ্রহ করে সেবাটি ব্যবহার করবেন না।`,
    sections: [
      {
        heading: "১. যোগ্যতা",
        body: [
          "এই সেবাটি বাংলাদেশের সক্রিয় রবি ও এয়ারটেল মোবাইল গ্রাহকদের জন্য প্রযোজ্য।",
          "আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে, অথবা অভিভাবকের তত্ত্বাবধান ও সম্মতিতে সেবাটি ব্যবহার করতে হবে। সেবা ব্যবহার করে আপনি নিশ্চিত করছেন যে নিবন্ধিত মোবাইল নম্বরটি আপনার নিজের।",
        ],
      },
      {
        heading: "২. সেবা সম্পর্কে",
        body: [
          "Hidayah নামাজের সময়, কিবলা কম্পাস, অনুবাদ ও অডিওসহ পবিত্র কুরআন, দোয়া, ৯৯ নাম, তাসবিহ কাউন্টার, হিজরি ক্যালেন্ডার, হাদিস এবং সম্পর্কিত ফিচার বাংলা ও ইংরেজিতে প্রদান করে।",
          "প্রিমিয়াম ফিচার ব্যবহারের জন্য একটি সক্রিয় সাবস্ক্রিপশন প্রয়োজন। ফিচার যেকোনো সময় যোগ, পরিবর্তন বা অপসারণ করা হতে পারে।",
        ],
      },
      {
        heading: "৩. সাবস্ক্রিপশন ও চার্জ",
        body: [
          `প্রিমিয়াম অ্যাক্সেস ক্যারিয়ার-বিলড সাবস্ক্রিপশনের মাধ্যমে দেওয়া হয়। সাবস্ক্রাইব করার মাধ্যমে আপনি আপনার মোবাইল অপারেটরকে আপনার অ্যাকাউন্ট থেকে ${CHARGE_BN} কাটার অনুমতি দিচ্ছেন।`,
          "বাতিল না করা পর্যন্ত প্রতিটি বিলিং চক্রে সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে নবায়িত হয়। চার্জ সরাসরি আমরা নয়, আপনার মোবাইল অপারেটর ও তার বিলিং অ্যাগ্রিগেটর সংগ্রহ করে।",
        ],
      },
      {
        heading: "৪. প্রমাণীকরণ ও আপনার অ্যাকাউন্ট",
        body: [
          "আপনি আপনার মোবাইল নম্বর ও SMS-এ পাঠানো ওয়ান-টাইম পাসওয়ার্ড (OTP) দিয়ে সাইন ইন করেন। আপনার ডিভাইস ও OTP সুরক্ষিত রাখার দায়িত্ব আপনার।",
          "প্রতিটি মোবাইল নম্বরে একটি অ্যাকাউন্ট অনুমোদিত।",
        ],
      },
      {
        heading: "৫. ধর্মীয় কনটেন্ট ও নির্ভুলতা",
        body: [
          "নামাজের সময় আপনার অবস্থান ও প্রমিত গণনা পদ্ধতি থেকে হিসাব করা হয় এবং কেবল সুবিধার্থে দেওয়া হয়; এটি আপনার স্থানীয় মসজিদ বা কর্তৃপক্ষের সময় থেকে সামান্য ভিন্ন হতে পারে। কিবলা দিকনির্দেশ আপনার ডিভাইসের সেন্সর ও অবস্থানের ভিত্তিতে একটি আনুমানিক হিসাব।",
          "কুরআনের টেক্সট, অনুবাদ, অডিও তিলাওয়াত ও হাদিস তৃতীয় পক্ষের উৎস থেকে নেওয়া। নির্ভুলতার জন্য আমরা চেষ্টা করলেও সব কনটেন্ট ত্রুটিমুক্ত থাকার নিশ্চয়তা দিই না। সেবাটি ইবাদতে সহায়ক, কিন্তু যোগ্য আলেমের নির্দেশনার বিকল্প নয়।",
        ],
      },
      {
        heading: "৬. অবস্থান ও অনুমতি",
        body: [
          "কিছু ফিচার (নামাজের সময়, কিবলা) আপনার আনুমানিক অবস্থানের অ্যাক্সেস পেলে ভালো কাজ করে। অবস্থানের অনুমতি না দিয়েও আপনি কম নির্ভুলতায় সেবা ব্যবহার করতে পারেন। ডিভাইস সেটিংস থেকে অনুমতি নিয়ন্ত্রণ করতে পারেন।",
        ],
      },
      {
        heading: "৭. বাতিল ও আনসাবস্ক্রাইব",
        body: [
          "আপনি যেকোনো সময় সেবার মধ্যে থাকা আনসাবস্ক্রাইব অপশন ব্যবহার করে, অথবা আপনার মোবাইল অপারেটরের নির্দেশনা অনুসরণ করে বাতিল করতে পারেন।",
          "বাতিল করলে ভবিষ্যতের চার্জ বন্ধ হয়। চলতি বিলিং চক্র শেষ হওয়া পর্যন্ত আপনার প্রিমিয়াম অ্যাক্সেস থাকে।",
        ],
      },
      {
        heading: "৮. রিফান্ড",
        body: [
          "প্রযোজ্য আইন বা আপনার মোবাইল অপারেটরের নীতিতে আবশ্যক না হলে সাবস্ক্রিপশন চার্জ সাধারণত ফেরতযোগ্য নয়।",
        ],
      },
      {
        heading: "৯. গ্রহণযোগ্য ব্যবহার",
        body: [
          "আপনি সেবাটি শ্রদ্ধার সাথে ও আইনসম্মতভাবে ব্যবহার করতে এবং সেবা বা এর কনটেন্ট অপব্যবহার, নকল, পুনর্বিতরণ, ব্যাহত বা রিভার্স-ইঞ্জিনিয়ার না করতে সম্মত হচ্ছেন।",
        ],
      },
      {
        heading: "১০. মেধাস্বত্ব ও তৃতীয় পক্ষের কনটেন্ট",
        body: [
          `অ্যাপ, এর ডিজাইন ও সফটওয়্যার ${COMPANY} বা তার লাইসেন্সদাতাদের মালিকানাধীন। কুরআনের টেক্সট ও অনুবাদ, হাদিস সংকলন, নামাজের সময়ের ডেটা ও অনুরূপ কনটেন্ট সংশ্লিষ্ট স্বত্বাধিকারীদের দেওয়া এবং তাদের সম্পত্তি হিসেবে থাকে।`,
        ],
      },
      {
        heading: "১১. দাবিত্যাগ ও দায়সীমা",
        body: [
          'সেবাটি "যেমন আছে" এবং "যেমন উপলব্ধ" ভিত্তিতে কোনো ধরনের ওয়ারেন্টি ছাড়াই দেওয়া হয়, যার মধ্যে ধর্মীয় কনটেন্ট, নামাজের সময় বা কিবলা দিকের নির্ভুলতাও অন্তর্ভুক্ত।',
          "আইন দ্বারা অনুমোদিত সর্বোচ্চ সীমা পর্যন্ত, সেবার ব্যবহার বা এর উপর নির্ভরতার ফলে সৃষ্ট কোনো পরোক্ষ, আনুষঙ্গিক বা ফলশ্রুতিগত ক্ষতির জন্য আমরা দায়ী নই।",
        ],
      },
      {
        heading: "১২. শর্তাবলীর পরিবর্তন",
        body: [
          "আমরা সময়ে সময়ে এই শর্তাবলী বা সেবা হালনাগাদ করতে পারি। গুরুত্বপূর্ণ পরিবর্তন উপরের 'সর্বশেষ হালনাগাদ' তারিখে প্রতিফলিত হবে। পরিবর্তন কার্যকর হওয়ার পর অব্যাহত ব্যবহার সম্মতি হিসেবে গণ্য হবে।",
        ],
      },
      {
        heading: "১৩. প্রযোজ্য আইন",
        body: [
          "এই শর্তাবলী বাংলাদেশের আইন দ্বারা নিয়ন্ত্রিত এবং যেকোনো বিরোধ বাংলাদেশের উপযুক্ত আদালতের একচেটিয়া এখতিয়ারভুক্ত।",
        ],
      },
      {
        heading: "১৪. যোগাযোগ",
        body: [`এই শর্তাবলী সম্পর্কে প্রশ্ন থাকলে ${CONTACT} ঠিকানায় যোগাযোগ করুন।`],
      },
    ],
  },
  privacy: {
    title: "গোপনীয়তা নীতি",
    updated: `সর্বশেষ হালনাগাদ: ${LAST_UPDATED_BN}`,
    intro:
      `এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আপনি Hidayah ব্যবহার করলে ${COMPANY} কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করে। সেবা ব্যবহার করে আপনি এখানে বর্ণিত পদ্ধতিতে সম্মতি দিচ্ছেন।`,
    sections: [
      {
        heading: "১. আমরা যে তথ্য সংগ্রহ করি",
        body: [
          "অ্যাকাউন্ট তথ্য: আপনার মোবাইল নম্বর ও প্রমাণীকরণ (OTP) লগ।",
          "আপনার পছন্দ ও সংরক্ষিত তথ্য: যেমন বুকমার্ক, নামাজের লগ, কুরআন পড়ার অগ্রগতি (খতম) ও রিডার সেটিংস, যা আপনার ডিভাইসগুলোর মধ্যে সিঙ্ক হতে পারে।",
          "অবস্থান: নামাজের সময় ও কিবলা হিসাব করতে আপনার আনুমানিক অবস্থান, শুধুমাত্র আপনি অনুমতি দিলে।",
          "কারিগরি তথ্য: স্বয়ংক্রিয়ভাবে সংগৃহীত ডিভাইস ও ব্যবহারের তথ্য, যেমন অ্যাপ/ব্রাউজারের ধরন ও আনুমানিক কার্যকলাপের সময়।",
        ],
      },
      {
        heading: "২. আমরা যেভাবে তথ্য ব্যবহার করি",
        body: [
          "সেবা পরিচালনা, আপনার নম্বর যাচাই, নামাজের সময় ও কিবলা হিসাব, ডিভাইসগুলোর মধ্যে সংরক্ষিত তথ্য সিঙ্ক, সহায়তা প্রদান, প্রতারণা রোধ এবং আইনি বাধ্যবাধকতা পালনের জন্য।",
        ],
      },
      {
        heading: "৩. ক্যারিয়ার বিলিং",
        body: [
          "আপনার সাবস্ক্রিপশন আপনার মোবাইল অপারেটর বিল করে। এটি সক্ষম করতে চার্জ ও সাবস্ক্রিপশন ব্যবস্থাপনার জন্য আপনার মোবাইল নম্বর অপারেটর ও তার বিলিং অ্যাগ্রিগেটরের সাথে শেয়ার করা হয়।",
        ],
      },
      {
        heading: "৪. তৃতীয় পক্ষের কনটেন্ট প্রদানকারী",
        body: [
          "কুরআনের টেক্সট, অনুবাদ, অডিও, হাদিস ও নামাজের সময়ের ডেটা দেখাতে অ্যাপটি তৃতীয় পক্ষের প্রদানকারীদের কাছ থেকে কনটেন্ট অনুরোধ করতে পারে। এসব কনটেন্টের ব্যবহার ওই প্রদানকারীদের শর্তাবলীর অধীনও।",
        ],
      },
      {
        heading: "৫. আমরা যেভাবে তথ্য শেয়ার করি",
        body: [
          "আমরা মোবাইল অপারেটর ও বিলিং অ্যাগ্রিগেটর এবং সেবা পরিচালনায় সহায়তাকারী সেবা প্রদানকারীদের সাথে, এবং আইন অনুযায়ী প্রয়োজন হলে কর্তৃপক্ষের সাথে তথ্য শেয়ার করি।",
          "আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না।",
        ],
      },
      {
        heading: "৬. কুকি ও লোকাল স্টোরেজ",
        body: [
          "আপনাকে সাইন-ইন অবস্থায় রাখতে, অফলাইন ব্যবহারের জন্য কনটেন্ট ক্যাশ করতে এবং ভাষা ও থিমের মতো পছন্দ মনে রাখতে আমরা লোকাল স্টোরেজ ও অনুরূপ প্রযুক্তি ব্যবহার করি।",
        ],
      },
      {
        heading: "৭. তথ্য সংরক্ষণ",
        body: [
          "আপনার অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত এবং সেবা প্রদান, বিরোধ নিষ্পত্তি ও আইনি প্রয়োজন মেটাতে যতদিন দরকার ততদিন আমরা আপনার তথ্য সংরক্ষণ করি।",
        ],
      },
      {
        heading: "৮. নিরাপত্তা",
        body: [
          "আপনার তথ্য সুরক্ষায় আমরা যুক্তিসঙ্গত কারিগরি ও সাংগঠনিক ব্যবস্থা গ্রহণ করি। তবে কোনো প্রেরণ বা সংরক্ষণ পদ্ধতি সম্পূর্ণ নিরাপদ নয়।",
        ],
      },
      {
        heading: "৯. আপনার অধিকার",
        body: [
          "প্রযোজ্য আইন সাপেক্ষে, আপনি আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন এবং যেকোনো সময় আনসাবস্ক্রাইব করতে পারেন। নিচের তথ্য ব্যবহার করে যোগাযোগ করুন।",
        ],
      },
      {
        heading: "১০. শিশু",
        body: [
          "সেবাটি ১৮ বছরের কম বয়সী শিশুদের জন্য নয় এবং আমরা জেনেশুনে তাদের ব্যক্তিগত তথ্য সংগ্রহ করি না।",
        ],
      },
      {
        heading: "১১. নীতির পরিবর্তন",
        body: [
          "আমরা সময়ে সময়ে এই নীতি হালনাগাদ করতে পারি। পরিবর্তন উপরের 'সর্বশেষ হালনাগাদ' তারিখে নির্দেশিত হবে।",
        ],
      },
      {
        heading: "১২. যোগাযোগ",
        body: [`গোপনীয়তা সংক্রান্ত প্রশ্ন বা অনুরোধের জন্য ${CONTACT} ঠিকানায় যোগাযোগ করুন।`],
      },
    ],
  },
};

const legal: Record<Lang, { terms: LegalDoc; privacy: LegalDoc }> = { en, bn };

export default legal;
