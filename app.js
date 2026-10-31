import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { useState, useEffect, useMemo, useRef } from "react";
import { Search, UserPlus, BarChart3, Phone, MessageCircle, LocateFixed, X, Trash2, Star, List, Map as MapIcon, Navigation, ShieldCheck, Check, Flag, Send, MessageSquare, Users, Gift, CreditCard, Bell, Globe, Lock, LogOut, User, Plus, GraduationCap, } from "lucide-react";
/* ---------------- static data ---------------- */
const CITIES = [
    { name: "تونس العاصمة", lat: 36.8065, lng: 10.1815 },
    { name: "أريانة", lat: 36.8625, lng: 10.1956 },
    { name: "المرسى", lat: 36.8782, lng: 10.3247 },
    { name: "بن عروس", lat: 36.7531, lng: 10.2189 },
    { name: "منوبة", lat: 36.8081, lng: 10.0972 },
    { name: "بنزرت", lat: 37.2744, lng: 9.8739 },
    { name: "نابل", lat: 36.4561, lng: 10.7376 },
    { name: "سوسة", lat: 35.8256, lng: 10.636 },
    { name: "المنستير", lat: 35.7643, lng: 10.8113 },
    { name: "المهدية", lat: 35.5047, lng: 11.0622 },
    { name: "القيروان", lat: 35.6781, lng: 10.0963 },
    { name: "صفاقس", lat: 34.7406, lng: 10.7603 },
    { name: "قابس", lat: 33.8815, lng: 10.0982 },
];
const SUBJECTS = ["رياضيات", "فيزياء", "علوم", "عربية", "فرنسية", "إنجليزية", "فلسفة", "إعلامية", "اقتصاد وتصرف"];
const LEVELS = ["ابتدائي", "إعدادي", "ثانوي", "باكالوريا"];
const TYPES = { teacher_pub: "معلم/أستاذ (قطاع عمومي)", teacher_priv: "معلم/أستاذ (قطاع خاص)", retired: "أستاذ متقاعد", grad: "خريج", student: "طالب جامعي", lang: "مدرّب لغات", center: "مركز دعم مرخّص" };
const MODES = ["في منزل التلميذ", "في منزل الأستاذ", "عن بُعد", "في المركز"];
const RADII = [2, 5, 10, 25, 50];
const AVATAR_COLORS = ["#1D3B8C", "#C73A3F", "#1E8A4A", "#8A5A1E", "#5A3B8C", "#0E7C86"];
/* Finite, closed lists (unlike free-text names/bios/reviews) can be fully translated. */
const SUBJECT_FR = { "رياضيات": "Mathématiques", "فيزياء": "Physique", "علوم": "Sciences", "عربية": "Arabe", "فرنسية": "Français", "إنجليزية": "Anglais", "فلسفة": "Philosophie", "إعلامية": "Informatique", "اقتصاد وتصرف": "Économie et gestion" };
const LEVEL_FR = { "ابتدائي": "Primaire", "إعدادي": "Collège", "ثانوي": "Lycée", "باكالوريا": "Baccalauréat" };
const MODE_FR = { "في منزل التلميذ": "Chez l'élève", "في منزل الأستاذ": "Chez l'enseignant", "عن بُعد": "À distance", "في المركز": "Au centre" };
const TYPE_FR = { teacher_pub: "Enseignant (secteur public)", teacher_priv: "Enseignant (secteur privé)", retired: "Enseignant retraité", grad: "Diplômé", student: "Étudiant", lang: "Formateur de langues", center: "Centre de soutien agréé" };
const CITY_FR = { "تونس العاصمة": "Tunis", "أريانة": "Ariana", "المرسى": "La Marsa", "بن عروس": "Ben Arous", "منوبة": "Manouba", "بنزرت": "Bizerte", "نابل": "Nabeul", "سوسة": "Sousse", "المنستير": "Monastir", "المهدية": "Mahdia", "القيروان": "Kairouan", "صفاقس": "Sfax", "قابس": "Gabès" };
const SEED = [
    { id: "s1", name: "سامي الطرابلسي", type: "retired", gender: "m", subjects: ["رياضيات", "فيزياء"], levels: ["ثانوي", "باكالوريا"], price: 30, unit: "ساعة", area: "المنزه", lat: 36.842, lng: 10.17, phone: "20100101", modes: ["في منزل الأستاذ"], bio: "32 سنة في تدريس الرياضيات بالمعاهد الثانوية. مجموعات صغيرة لا تتجاوز 4 تلاميذ، وتمارين مراجعة للباكالوريا كل أسبوع.", pack: { n: 8, price: 220 } },
    { id: "s2", name: "مريم بن سالم", type: "grad", gender: "f", subjects: ["فرنسية"], levels: ["إعدادي", "ثانوي"], price: 20, unit: "ساعة", area: "أريانة المدينة", lat: 36.866, lng: 10.193, phone: "20100102", modes: ["في منزل التلميذ", "عن بُعد"], bio: "ماجستير في الأدب الفرنسي. تركيز على التعبير الكتابي وتحليل النصوص.", pack: null },
    { id: "s3", name: "مركز النجاح للدعم", type: "center", gender: null, subjects: ["رياضيات", "فيزياء", "علوم", "إنجليزية"], levels: ["إعدادي", "ثانوي", "باكالوريا"], price: 90, unit: "شهر", area: "النصر", lat: 36.855, lng: 10.165, phone: "20100103", modes: ["في المركز"], bio: "مركز مرخّص بقاعات مكيّفة. حصتان في الأسبوع لكل مادة، وامتحانات تجريبية قبل كل ثلاثي.", pack: null },
    { id: "s4", name: "ياسين الجلاصي", type: "student", gender: "m", subjects: ["رياضيات", "إعلامية"], levels: ["إعدادي", "ثانوي"], price: 15, unit: "ساعة", area: "المنار", lat: 36.838, lng: 10.16, phone: "20100104", modes: ["في منزل التلميذ", "عن بُعد"], bio: "طالب هندسة. أشرح بطريقة بسيطة وأساعد في البرمجة بلغة Python لتلاميذ شعبة الإعلامية.", pack: null },
    { id: "s5", name: "سلوى القاسمي", type: "retired", gender: "f", subjects: ["عربية", "فلسفة"], levels: ["باكالوريا"], price: 25, unit: "ساعة", area: "المرسى", lat: 36.879, lng: 10.321, phone: "20100105", modes: ["في منزل الأستاذ"], bio: "أستاذة فلسفة متقاعدة. منهجية المقال الفلسفي خطوة بخطوة، مع تصحيح مفصّل لكل مقال.", pack: { n: 4, price: 90 } },
    { id: "s6", name: "أنيس الحمامي", type: "lang", gender: "m", subjects: ["إنجليزية"], levels: ["ابتدائي", "إعدادي", "ثانوي", "باكالوريا"], price: 25, unit: "ساعة", area: "قمرت", lat: 36.9, lng: 10.29, phone: "20100106", modes: ["عن بُعد", "في منزل التلميذ"], bio: "شهادة CELTA. محادثة وقواعد وتحضير لامتحان الإنجليزية في الباكالوريا.", pack: null },
    { id: "s7", name: "هالة الزواري", type: "grad", gender: "f", subjects: ["علوم", "فيزياء"], levels: ["ثانوي", "باكالوريا"], price: 20, unit: "ساعة", area: "بن عروس", lat: 36.755, lng: 10.225, phone: "20100107", modes: ["في منزل التلميذ"], bio: "ماجستير في علوم الحياة والأرض. ملخصات مصوّرة لكل محور.", pack: null },
    { id: "s8", name: "رحمة الشابي", type: "grad", gender: "f", subjects: ["رياضيات", "عربية", "فرنسية"], levels: ["ابتدائي"], price: 15, unit: "ساعة", area: "منوبة", lat: 36.81, lng: 10.1, phone: "20100108", modes: ["في منزل الأستاذ"], bio: "مرافقة تلاميذ الابتدائي في الواجبات والتحضير لمناظرة السيزيام.", pack: null },
    { id: "s9", name: "مركز الإتقان", type: "center", gender: null, subjects: ["رياضيات", "فيزياء", "علوم", "فرنسية", "إنجليزية"], levels: ["إعدادي", "ثانوي", "باكالوريا"], price: 100, unit: "شهر", area: "سهلول، سوسة", lat: 35.838, lng: 10.593, phone: "20100109", modes: ["في المركز"], bio: "مركز مرخّص. أفواج حسب المستوى ومتابعة شهرية مع الأولياء.", pack: null },
    { id: "s10", name: "كريم بوعزيز", type: "retired", gender: "m", subjects: ["رياضيات"], levels: ["باكالوريا"], price: 30, unit: "ساعة", area: "سوسة المدينة", lat: 35.825, lng: 10.638, phone: "20100110", modes: ["في منزل الأستاذ"], bio: "متخصص في باكالوريا الرياضيات والعلوم التجريبية.", pack: { n: 8, price: 210 } },
    { id: "s11", name: "نور الهدى المكني", type: "student", gender: "f", subjects: ["علوم", "فيزياء"], levels: ["ثانوي"], price: 15, unit: "ساعة", area: "المنستير", lat: 35.772, lng: 10.808, phone: "20100111", modes: ["في منزل التلميذ", "عن بُعد"], bio: "طالبة طب. أساعد في فهم الدروس وليس الحفظ فقط.", pack: null },
    { id: "s12", name: "فاطمة العياري", type: "grad", gender: "f", subjects: ["عربية", "فرنسية"], levels: ["ابتدائي"], price: 12, unit: "ساعة", area: "صفاقس الجديدة", lat: 34.745, lng: 10.765, phone: "20100112", modes: ["في منزل الأستاذ"], bio: "القراءة والكتابة للأطفال بطريقة ممتعة.", pack: null },
    { id: "s13", name: "محمد علي الفقي", type: "retired", gender: "m", subjects: ["اقتصاد وتصرف"], levels: ["باكالوريا"], price: 25, unit: "ساعة", area: "صفاقس", lat: 34.752, lng: 10.748, phone: "20100113", modes: ["في منزل الأستاذ", "عن بُعد"], bio: "أستاذ اقتصاد وتصرف متقاعد. تمارين المحاسبة والتصرف مع الإصلاح.", pack: null },
    { id: "s14", name: "إيناس الدريدي", type: "lang", gender: "f", subjects: ["فرنسية", "إنجليزية"], levels: ["ابتدائي", "إعدادي", "ثانوي"], price: 20, unit: "ساعة", area: "نابل", lat: 36.452, lng: 10.732, phone: "20100114", modes: ["عن بُعد", "في منزل التلميذ"], bio: "مدرّبة لغات. محادثة ونطق وقواعد.", pack: null },
    { id: "s15", name: "وليد السعيدي", type: "grad", gender: "m", subjects: ["إعلامية"], levels: ["ثانوي", "باكالوريا"], price: 20, unit: "ساعة", area: "بنزرت", lat: 37.272, lng: 9.868, phone: "20100115", modes: ["في منزل التلميذ", "عن بُعد"], bio: "مهندس إعلامية. خوارزميات وبرمجة وقواعد بيانات لشعبة الإعلامية.", pack: null },
    { id: "s16", name: "آمنة الكافي", type: "student", gender: "f", subjects: ["رياضيات", "فيزياء"], levels: ["إعدادي"], price: 12, unit: "ساعة", area: "المنزه السادس", lat: 36.87, lng: 10.18, phone: "20100116", modes: ["في منزل التلميذ"], bio: "طالبة في المرحلة التحضيرية. تحضير مناظرة النوفيام.", pack: null },
    { id: "s17", name: "عادل بن يوسف", type: "teacher_pub", gender: "m", subjects: ["رياضيات"], levels: ["إعدادي", "ثانوي"], price: 25, unit: "ساعة", area: "أريانة", lat: 36.858, lng: 10.19, phone: "20100117", modes: ["في منزل الأستاذ"], bio: "أستاذ رياضيات بمعهد ثانوي.", pack: null },
    { id: "s18", name: "سامية الغربي", type: "teacher_priv", gender: "f", subjects: ["فرنسية", "إنجليزية"], levels: ["ابتدائي", "إعدادي"], price: 22, unit: "ساعة", area: "المرسى", lat: 36.877, lng: 10.318, phone: "20100118", modes: ["في منزل التلميذ", "عن بُعد"], bio: "معلمة بمدرسة خاصة، تدرّس اللغات منذ 6 سنوات.", pack: null },
];
const SEED_REVIEWS = [
    { id: "r1", tid: "s1", name: "أسماء", stars: 5, level: "باكالوريا", text: "تحسّن معدلي في الرياضيات من 9 إلى 14 في ثلاثي واحد. يشرح بصبر.", date: "2026-05-20" },
    { id: "r2", tid: "s1", name: "وليّ أمر", stars: 5, level: "ثانوي", text: "جدّي ومنظم، ويتصل بنا إذا غاب الابن.", date: "2026-04-11" },
    { id: "r3", tid: "s1", name: "حمزة", stars: 4, level: "باكالوريا", text: "ممتاز لكن المجموعة أحياناً تتأخر في البداية.", date: "2026-03-02" },
    { id: "r4", tid: "s3", name: "سيرين", stars: 4, level: "ثانوي", text: "القاعات مريحة والامتحانات التجريبية مفيدة.", date: "2026-05-02" },
    { id: "r5", tid: "s3", name: "وليّ أمر", stars: 5, level: "إعدادي", text: "متابعة جيدة مع الأولياء كل شهر.", date: "2026-02-14" },
    { id: "r6", tid: "s3", name: "تلميذ", stars: 4, level: "باكالوريا", text: "أستاذ الفيزياء ممتاز.", date: "2026-01-19" },
    { id: "r7", tid: "s5", name: "ملاك", stars: 5, level: "باكالوريا", text: "فهمت أخيراً كيف أكتب مقالاً فلسفياً.", date: "2026-05-28" },
    { id: "r8", tid: "s5", name: "يوسف", stars: 5, level: "باكالوريا", text: "التصحيح دقيق جداً.", date: "2026-04-03" },
    { id: "r9", tid: "s6", name: "رنيم", stars: 5, level: "إعدادي", text: "الحصص عن بعد منظمة وممتعة.", date: "2026-03-22" },
    { id: "r10", tid: "s6", name: "تلميذ", stars: 4, level: "ثانوي", text: "جيد في المحادثة.", date: "2026-02-08" },
    { id: "r11", tid: "s2", name: "إسراء", stars: 4, level: "ثانوي", text: "تحسّن التعبير الكتابي عندي.", date: "2026-04-17" },
    { id: "r12", tid: "s4", name: "آدم", stars: 5, level: "ثانوي", text: "يشرح البرمجة بطريقة سهلة.", date: "2026-05-09" },
    { id: "r13", tid: "s4", name: "وليّ أمر", stars: 4, level: "إعدادي", text: "شاب جدّي وأسعاره مناسبة.", date: "2026-03-15" },
    { id: "r14", tid: "s9", name: "تلميذ", stars: 4, level: "باكالوريا", text: "جيد لكن الأفواج كبيرة نوعاً ما.", date: "2026-04-25" },
    { id: "r15", tid: "s9", name: "نسرين", stars: 3, level: "ثانوي", text: "التوقيت غير مناسب لي.", date: "2026-01-30" },
    { id: "r16", tid: "s10", name: "مهدي", stars: 5, level: "باكالوريا", text: "أفضل أستاذ رياضيات في سوسة.", date: "2026-05-30" },
    { id: "r17", tid: "s10", name: "وليّ أمر", stars: 5, level: "باكالوريا", text: "نتيجة واضحة في الباكالوريا.", date: "2026-06-25" },
    { id: "r18", tid: "s7", name: "دنيا", stars: 4, level: "ثانوي", text: "الملخصات مفيدة للمراجعة.", date: "2026-03-05" },
    { id: "r19", tid: "s13", name: "تلميذ", stars: 5, level: "باكالوريا", text: "تمارين كثيرة ومصححة.", date: "2026-05-14" },
    { id: "r20", tid: "s16", name: "لينا", stars: 3, level: "إعدادي", text: "طيبة لكن تلغي الحصص أحياناً.", date: "2026-02-20" },
];
const FAR_FUTURE = "2030-01-01T00:00:00.000Z";
const INITIAL = {
    registered: [],
    contacts: {},
    views: { s1: 142, s3: 96, s9: 88, s5: 61, s10: 74 },
    reviews: SEED_REVIEWS,
    reviewed: [],
    reports: [],
    messages: {},
    savedSearches: [],
    children: [],
    verifications: { s1: "verified", s3: "verified", s10: "verified", s9: "verified", s5: "pending" },
    phoneVerified: { s1: true, s2: true, s3: true, s6: true, s10: true, s9: true },
    subscriptions: {
        s1: { active: true, plan: "featured", until: FAR_FUTURE },
        s3: { active: true, plan: "featured", until: FAR_FUTURE },
        s9: { active: true, plan: "featured", until: FAR_FUTURE },
    },
    referrals: { s1: { count: 3 } },
    ownerPass: null,
    lang: "ar",
    settings: { trialDays: 60, subPriceDT: 50 },
};
/* ---------------- strings ---------------- */
const STR = {
    ar: {
        brand: "علمني", tagline: "أستاذ قريب منك، في المادة التي تحتاجها",
        navSearch: "ابحث", navRegister: "سجّل كأستاذ", navAccount: "حسابي", navOwner: "المالك",
        locateMe: "حدّد موقعي", locating: "جارٍ التحديد",
        allSubjects: "كل المواد", level: "المستوى", allLevels: "الكل", distance: "المسافة", sort: "الترتيب",
        sortNear: "الأقرب", sortRating: "الأعلى تقييماً", gender: "الأستاذ", genderAll: "الكل", genderM: "أستاذ", genderF: "أستاذة",
        verifiedOnly: "موثّقون فقط", view: "طريقة العرض", listView: "قائمة", mapView: "خريطة",
        results: "نتيجة", results2: "نتائج", within: "في حدود", km: "كم", noResults: "لا يوجد أستاذ بهذه الشروط في حدود",
        widen: "وسّع البحث إلى", saveSearch: "احفظ هذا البحث", saved: "تم حفظ البحث", noRatingYet: "بدون تقييم بعد",
        ratingsWord: "تقييمات", ratingsWordMany: "تقييماً", demoNote: "نموذج تجريبي: الأسماء وأرقام الهاتف وهمية. الملفات المميّزة تظهر أولاً لأن أصحابها دفعوا مقابل الظهور.",
        mapHint: "اضغط على أي سعر لفتح ملف الأستاذ. اضغط على الخريطة أو اسحب النقطة الحمراء لتغيير موقعك.",
        featured: "مميّز", verified: "موثّق", phoneVerified: "الهاتف موثّق",
        registerTitle: "سجّل ملفك", registerLead: "بعد النشر، يظهر ملفك للتلاميذ القريبين من مكانك ويتصلون بك مباشرة.",
        fullName: "الاسم الكامل أو اسم المركز", role: "الصفة", phone: "رقم الهاتف",
        subjects: "المواد", levels: "المستويات", lessonMode: "طريقة الدرس", city: "المدينة",
        price: "السعر", hour: "ساعة", month: "شهر", mapPlace: "مكان الدرس على الخريطة", myLoc: "موقعي",
        mapPlaceHint1: "اضغط على الخريطة أو اسحب النقطة الحمراء إلى مكانك بالضبط.", mapPlaceHint1b: "تم تحديد المكان. ",
        mapPlaceHintCenter: "عنوان المركز يظهر بدقة مع زر الاتجاهات.", mapPlaceHintPerson: "يظهر للتلاميذ مكان تقريبي فقط (حوالي 500 م) لحماية خصوصيتك.",
        area: "الحي (اختياري)", bio: "نبذة قصيرة", bioPh: "خبرتك وطريقتك في التدريس",
        genderReq: "صفتك", packTitle: "باقة حصص (اختياري)", packSessions: "عدد الحصص", packPrice: "سعر الباقة (د)",
        refCodeField: "رمز إحالة أستاذ آخر (اختياري)",
        termsTitle: "شروط النشر", termsPrompt: "لم توافق بعد على شروط النشر.", termsAgreedLabel: "تمت الموافقة على شروط النشر",
        termsReadBtn: "الاطّلاع والموافقة", termsEditLink: "مراجعة", termsAgreeBtn: "أوافق",
        termsIntro: "قبل نشر ملفك، يرجى الاطلاع على البنود التالية والموافقة عليها:",
        termsItems: [
            { t: "صحة الهوية", d: "الاسم ورقم الهاتف والصفة المهنية المذكورة صحيحة وقابلة للتحقق." },
            { t: "الأهلية لممارسة النشاط", d: "أنا غير ممنوع قانونياً من تقديم دروس خصوصية." },
            { t: "حماية القاصرين", d: "ألتزم بسلوك مهني لائق مع التلاميذ القاصرين، وعدم طلب معلومات شخصية منهم خارج إطار الدرس." },
            { t: "العلاقة المباشرة", d: "الاتفاق والدفع يتمّان مباشرة بيني وبين التلميذ أو وليّه؛ المنصة وسيط عرض فقط." },
            { t: "عدم التلاعب بالتقييمات", d: "لا ألجأ إلى طلب أو تحرير تقييمات وهمية." },
            { t: "دقة المعلومات المعروضة", d: "ألتزم بتحديث السعر والتوفر عند تغيّرهما." },
            { t: "حسن السلوك", d: "عدم الإساءة أو التحرش تجاه التلاميذ أو الأولياء أو أي مستخدم آخر." },
            { t: "ظهور البيانات", d: "أوافق على أن اسمي ورقم هاتفي يظهران للتلاميذ عبر المنصة." },
            { t: "الوضع الإداري", d: "أتحمّل وحدي مسؤولية تسوية وضعي الإداري إن اقتضى نشاطي ذلك." },
        ],
        termsOutro: "بالضغط على «أوافق» فإنك تقرّ بكل ما سبق، وأن الموقع لا يتحمل أي مسؤولية عن أي إخلال من طرفك بهذه الالتزامات.",
        publish: "انشر ملفي", published: "تم نشر ملفك",
        errName: "اكتب الاسم الكامل.", errPhone: "رقم الهاتف يجب أن يتكون من 8 أرقام.", errSubjects: "اختر مادة واحدة على الأقل.",
        errLevels: "اختر مستوى واحداً على الأقل.", errModes: "اختر طريقة تقديم الدرس.", errPrice: "حدّد السعر بالدينار.",
        errMap: "حدّد مكانك على الخريطة.", errDeclare: "يجب الموافقة على التصريح قبل النشر.", errGender: "اختر صفة الأستاذ (ذكر/أنثى).",
        errPack: "أكمل معلومات الباقة أو اترك الحقلين فارغين.",
        accountTitle: "حسابي", accountLead: "إدارة أبنائك وأساتذتك المفضّلين، أو متابعة ملفك كأستاذ.",
        imParent: "أنا ولي أمر", imTeacher: "أنا أستاذ",
        childrenTitle: "أبنائي", childName: "اسم الابن/الابنة", addChild: "أضف", noChildren: "لم تضف أي ابن بعد.",
        useLevel: "استعمل مستواه في البحث",
        savedTitle: "بحوثي المحفوظة", noSaved: "لا يوجد بحث محفوظ. من صفحة البحث اضغط «احفظ هذا البحث».",
        apply: "طبّق", newMatches: "جديد", inboxTitle: "رسائلي", noMessages: "لا توجد محادثات بعد.",
        teacherLookupTitle: "لوحة الأستاذ", teacherLookupLead: "أدخل رقم هاتفك الذي سجّلت به لعرض إحصائياتك وإدارة اشتراكك.",
        teacherLookupBtn: "عرض لوحتي", teacherNotFound: "لم نجد أستاذاً بهذا الرقم.",
        statViews: "مشاهدة", statContacts: "تواصل", statRating: "التقييم",
        phoneVerifyTitle: "توثيق رقم الهاتف", sendOtp: "أرسل رمز التحقق", otpDemo: "رمز تجريبي (في الواقع يصل عبر SMS):",
        otpInput: "أدخل الرمز", confirm: "تأكيد", otpWrong: "رمز غير صحيح.", otpOk: "تم توثيق رقم الهاتف",
        idVerifyTitle: "التوثيق الرسمي", idVerifyLead: "ارفع وثيقة هوية أو بطاقة مهنية ليراجعها فريقنا.",
        requestVerify: "اطلب التوثيق", pendingVerify: "طلبك قيد المراجعة.", isVerified: "ملفك موثّق ✔",
        subTitle: "الاشتراك", subNone: "غير مشترك حالياً.", subActiveUntil: "مشترك حتى",
        subscribeNow: "اشترك الآن", planBasic: "اشتراك سنوي", planFeatured: "مميّز (ظهور أولاً)",
        payVia: "الدفع عبر", paySuccess: "تم تفعيل اشتراكك بنجاح.", payFailed: "لم تكتمل عملية الدفع، حاول مجدداً.", payNoBackend: "الدفع غير مُفعّل بعد على هذا الموقع (لم يُضبط عنوان الخادم).",
        payViaNote: "بطاقة بنكية أو e-Dinar/D17 أو محفظة Flouci، كلها متاحة في نفس الصفحة.", payNow: "الدفع الآن",
        refTitle: "برنامج الإحالة", refLead: "شارك رمزك مع زميل أستاذ. عند تسجيله يحصل حسابك على أيام مجانية.",
        refCode: "رمزك", refShare: "شارك الرمز", refCount: "عدد الإحالات", refCopied: "تم نسخ الرمز",
        ownerTitle: "لوحة المالك", ownerLead: "التلاميذ يستعملون التطبيق مجاناً، والدخل يأتي من اشتراكات الأساتذة والمراكز.",
        gateSetTitle: "أنشئ كلمة سر للوحة المالك", gateSetLead: "هذه اللوحة خاصة بك فقط.",
        gateSetBtn: "احفظ كلمة السر", gateEnterTitle: "أدخل كلمة السر", gateEnterBtn: "دخول", gateWrong: "كلمة السر غير صحيحة.",
        logout: "خروج",
        filesPublished: "ملف منشور", contactsTotal: "اتصال تلميذ", reviewsTotal: "تقييم",
        calcTitle: "حاسبة الدخل السنوي", monthlySub: "الاشتراك السنوي (د)", featPrice: "الظهور المميّز (د)",
        subCount: "عدد المشتركين", featShare: "نسبة من يدفع للظهور المميّز",
        perMonth: "في السنة", perYearNote: "أي حوالي", perYear: "في السنة الدراسية (10 أشهر).",
        realSubs: "المشتركون الفعليون الآن", reportsTitle: "بلاغات جديدة", noReports: "لا توجد بلاغات.",
        dismiss: "تجاهل", deleteReview: "احذف التقييم", deleteFile: "احذف الملف",
        verifyQueueTitle: "طلبات التوثيق", noVerifyQueue: "لا توجد طلبات توثيق حالياً.", approve: "توثيق", reject: "رفض",
        latestReviews: "آخر التقييمات", deleteMisuse: "احذف أي تقييم مسيء أو مزيّف.",
        topRequested: "الأكثر طلباً", noContactsYet: "لم يُسجّل أي اتصال بعد.",
        myFiles: "الملفات التي أضفتها", noMyFiles: "لا توجد ملفات مضافة. جرّب التسجيل من تبويب «سجّل كأستاذ».", markPaid: "تمديد حتى هذا التاريخ", approveReg: "الموافقة حتى هذا التاريخ", pendingApproval: "في انتظار الموافقة", subExpiredOn: "انتهى في", paidUntil: "مدفوع حتى", trialUntil: "تجربة مجانية حتى", paidCheckbox: "تم الدفع فعلاً", viewProfile: "عرض الملف الكامل", settingsTitle: "إعدادات الاشتراك", trialDaysLabel: "مدة التجربة المجانية الافتراضية (يوم)", subPriceLabel: "سعر الاشتراك السنوي (د)",
        resetDemo: "مسح البيانات التجريبية", resetDone: "تم مسح البيانات التجريبية", fileDeleted: "تم حذف الملف",
        chatWith: "راسل داخل التطبيق", showPhone: "إظهار رقم الهاتف", call: "اتصال", whatsapp: "واتساب", directions: "الاتجاهات",
        approxNote: "الموقع المعروض تقريبي لحماية خصوصية الأستاذ، والعنوان الدقيق يُتّفق عليه عند الاتصال.",
        report: "أبلغ عن هذا الملف", reportReview: "أبلغ عن هذا التقييم", reportReason: "سبب البلاغ",
        reportSubmit: "أرسل البلاغ", reportSent: "تم إرسال البلاغ", reportOptNote: "تفاصيل إضافية (اختياري)",
        reasonInfo: "معلومات خاطئة", reasonBehavior: "سلوك غير لائق", reasonScam: "احتيال", reasonOther: "أخرى",
        chatPh: "اكتب رسالتك…", send: "إرسال", chatAutoReply: "شكراً لتواصلك، سأرد عليك في أقرب وقت.",
        reviewHint1: "شكراً، لقد قيّمت هذا الأستاذ.",
        reviewHint2: "يمكنك تقييم الأستاذ بعد التواصل معه عبر «راسل داخل التطبيق» أو إظهار رقم الهاتف. هذا يمنع التقييمات المزيّفة.",
        rateBtn: "قيّم هذا الأستاذ", yourRating: "تقييمك", yourName: "الاسم (اختياري)", yourLevel: "المستوى",
        yourComment: "تعليقك", commentPh: "كيف كانت الدروس؟", postReview: "انشر التقييم", starsErr: "اختر عدد النجوم.",
        reviewPosted: "تم نشر تقييمك", packLabel: "باقة",
        myCurrentLocation: "موقعي الحالي", mapPoint: "نقطة على الخريطة",
    },
    fr: {
        brand: "3allemni", tagline: "Un enseignant proche de vous, dans la matière voulue",
        navSearch: "Rechercher", navRegister: "Devenir enseignant", navAccount: "Mon compte", navOwner: "Admin",
        locateMe: "Me localiser", locating: "Localisation…",
        allSubjects: "Toutes les matières", level: "Niveau", allLevels: "Tous", distance: "Distance", sort: "Trier",
        sortNear: "Plus proche", sortRating: "Mieux notés", gender: "Enseignant", genderAll: "Tous", genderM: "Homme", genderF: "Femme",
        verifiedOnly: "Vérifiés seulement", view: "Affichage", listView: "Liste", mapView: "Carte",
        results: "résultat", results2: "résultats", within: "dans un rayon de", km: "km", noResults: "Aucun enseignant ne correspond dans un rayon de",
        widen: "Élargir à", saveSearch: "Enregistrer cette recherche", saved: "Recherche enregistrée", noRatingYet: "Pas encore d'avis",
        ratingsWord: "avis", ratingsWordMany: "avis", demoNote: "Prototype : noms et numéros fictifs. Les profils mis en avant apparaissent en premier car leurs auteurs ont payé la visibilité.",
        mapHint: "Touchez un prix pour ouvrir le profil. Touchez la carte ou déplacez le point rouge pour changer de position.",
        featured: "En avant", verified: "Vérifié", phoneVerified: "Téléphone vérifié",
        registerTitle: "Créer votre profil", registerLead: "Une fois publié, votre profil apparaît aux élèves proches et ils vous contactent directement.",
        fullName: "Nom complet ou nom du centre", role: "Statut", phone: "Numéro de téléphone",
        subjects: "Matières", levels: "Niveaux", lessonMode: "Mode de cours", city: "Ville",
        price: "Prix", hour: "heure", month: "mois", mapPlace: "Lieu des cours sur la carte", myLoc: "Ma position",
        mapPlaceHint1: "Touchez la carte ou déplacez le point rouge à votre emplacement exact.", mapPlaceHint1b: "Position définie. ",
        mapPlaceHintCenter: "L'adresse du centre est affichée précisément avec un bouton d'itinéraire.", mapPlaceHintPerson: "Seul un lieu approximatif (environ 500 m) est montré aux élèves, pour protéger votre vie privée.",
        area: "Quartier (facultatif)", bio: "Courte présentation", bioPh: "Votre expérience et votre méthode",
        genderReq: "Votre statut", packTitle: "Forfait de séances (facultatif)", packSessions: "Nombre de séances", packPrice: "Prix du forfait (DT)",
        refCodeField: "Code de parrainage d'un autre enseignant (facultatif)",
        termsTitle: "Conditions de publication", termsPrompt: "Vous n'avez pas encore accepté les conditions de publication.", termsAgreedLabel: "Conditions de publication acceptées",
        termsReadBtn: "Consulter et accepter", termsEditLink: "Revoir", termsAgreeBtn: "J'accepte",
        termsIntro: "Avant de publier votre profil, veuillez consulter les points suivants et les accepter :",
        termsItems: [
            { t: "Exactitude de l'identité", d: "Le nom, le numéro de téléphone et le statut professionnel indiqués sont exacts et vérifiables." },
            { t: "Aptitude à exercer", d: "Je ne suis pas légalement empêché(e) de donner des cours particuliers." },
            { t: "Protection des mineurs", d: "Je m'engage à un comportement professionnel correct envers les élèves mineurs, sans leur demander d'informations personnelles hors du cadre du cours." },
            { t: "Relation directe", d: "L'accord et le paiement se font directement entre moi et l'élève ou son tuteur ; la plateforme n'est qu'un intermédiaire de mise en relation." },
            { t: "Avis authentiques", d: "Je ne sollicite ni ne rédige de faux avis." },
            { t: "Exactitude des informations affichées", d: "Je m'engage à mettre à jour le prix et la disponibilité en cas de changement." },
            { t: "Bonne conduite", d: "Aucune insulte ni harcèlement envers les élèves, les parents ou tout autre utilisateur." },
            { t: "Affichage des données", d: "J'accepte que mon nom et mon numéro de téléphone soient visibles par les élèves sur la plateforme." },
            { t: "Situation administrative", d: "Je suis seul(e) responsable de régulariser ma situation administrative si mon activité l'exige." },
        ],
        termsOutro: "En cliquant sur « J'accepte », vous reconnaissez l'ensemble de ces points, et la plateforme n'est pas responsable de tout manquement de votre part à ces engagements.",
        publish: "Publier mon profil", published: "Profil publié",
        errName: "Indiquez le nom complet.", errPhone: "Le numéro doit contenir 8 chiffres.", errSubjects: "Choisissez au moins une matière.",
        errLevels: "Choisissez au moins un niveau.", errModes: "Choisissez un mode de cours.", errPrice: "Indiquez le prix en dinars.",
        errMap: "Placez-vous sur la carte.", errDeclare: "Vous devez accepter la déclaration avant de publier.", errGender: "Choisissez votre statut (homme/femme).",
        errPack: "Complétez les deux champs du forfait ou laissez-les vides.",
        accountTitle: "Mon compte", accountLead: "Gérez vos enfants et enseignants préférés, ou suivez votre profil d'enseignant.",
        imParent: "Je suis parent", imTeacher: "Je suis enseignant",
        childrenTitle: "Mes enfants", childName: "Nom de l'enfant", addChild: "Ajouter", noChildren: "Aucun enfant ajouté.",
        useLevel: "Utiliser son niveau pour la recherche",
        savedTitle: "Recherches enregistrées", noSaved: "Aucune recherche enregistrée. Depuis la recherche, touchez «Enregistrer cette recherche».",
        apply: "Appliquer", newMatches: "nouveaux", inboxTitle: "Mes messages", noMessages: "Aucune conversation.",
        teacherLookupTitle: "Espace enseignant", teacherLookupLead: "Entrez votre numéro de téléphone inscrit pour voir vos statistiques et gérer votre abonnement.",
        teacherLookupBtn: "Voir mon espace", teacherNotFound: "Aucun enseignant trouvé avec ce numéro.",
        statViews: "vues", statContacts: "contacts", statRating: "Note",
        phoneVerifyTitle: "Vérification du téléphone", sendOtp: "Envoyer le code", otpDemo: "Code de démonstration (envoyé par SMS en réel) :",
        otpInput: "Entrez le code", confirm: "Confirmer", otpWrong: "Code incorrect.", otpOk: "Téléphone vérifié",
        idVerifyTitle: "Vérification d'identité", idVerifyLead: "Envoyez une pièce d'identité ou une carte professionnelle pour vérification.",
        requestVerify: "Demander la vérification", pendingVerify: "Demande en cours d'examen.", isVerified: "Profil vérifié ✔",
        subTitle: "Abonnement", subNone: "Aucun abonnement actif.", subActiveUntil: "Actif jusqu'au",
        subscribeNow: "S'abonner", planBasic: "Abonnement annuel", planFeatured: "Mis en avant (priorité)",
        payVia: "Payer via", paySuccess: "Votre abonnement a été activé avec succès.", payFailed: "Le paiement n'a pas abouti, réessayez.", payNoBackend: "Le paiement n'est pas encore activé sur ce site (adresse du serveur non configurée).",
        payViaNote: "carte bancaire, e-Dinar/D17 ou wallet Flouci, tous disponibles sur la même page.", payNow: "Payer maintenant",
        refTitle: "Programme de parrainage", refLead: "Partagez votre code avec un collègue. Son inscription vous offre des jours gratuits.",
        refCode: "Votre code", refShare: "Partager le code", refCount: "Parrainages", refCopied: "Code copié",
        ownerTitle: "Tableau de bord admin", ownerLead: "Les élèves utilisent l'app gratuitement; les revenus viennent des abonnements des enseignants et centres.",
        gateSetTitle: "Créer un mot de passe admin", gateSetLead: "Ce tableau de bord est réservé à vous seul.",
        gateSetBtn: "Enregistrer le mot de passe", gateEnterTitle: "Entrez le mot de passe", gateEnterBtn: "Entrer", gateWrong: "Mot de passe incorrect.",
        logout: "Déconnexion",
        filesPublished: "profils publiés", contactsTotal: "contacts", reviewsTotal: "avis",
        calcTitle: "Simulateur de revenu annuel", monthlySub: "Abonnement annuel (DT)", featPrice: "Mise en avant (DT)",
        subCount: "Nombre d'abonnés", featShare: "Part payant la mise en avant",
        perMonth: "par an", perYearNote: "soit environ", perYear: "par année scolaire (10 mois).",
        realSubs: "Abonnés réels actuellement", reportsTitle: "Nouveaux signalements", noReports: "Aucun signalement.",
        dismiss: "Ignorer", deleteReview: "Supprimer l'avis", deleteFile: "Supprimer le profil",
        verifyQueueTitle: "Demandes de vérification", noVerifyQueue: "Aucune demande en attente.", approve: "Vérifier", reject: "Refuser",
        latestReviews: "Derniers avis", deleteMisuse: "Supprimez tout avis abusif ou faux.",
        topRequested: "Les plus demandés", noContactsYet: "Aucun contact enregistré.",
        myFiles: "Profils que vous avez ajoutés", noMyFiles: "Aucun profil ajouté. Essayez «Devenir enseignant».", markPaid: "Prolonger jusqu'à cette date", approveReg: "Approuver jusqu'à cette date", pendingApproval: "En attente d'approbation", subExpiredOn: "Expiré le", paidUntil: "Payé jusqu'au", trialUntil: "Essai gratuit jusqu'au", paidCheckbox: "Paiement reçu", viewProfile: "Voir le profil complet", settingsTitle: "Paramètres d'abonnement", trialDaysLabel: "Durée d'essai par défaut (jours)", subPriceLabel: "Prix de l'abonnement annuel (DT)",
        resetDemo: "Réinitialiser les données", resetDone: "Données réinitialisées", fileDeleted: "Profil supprimé",
        chatWith: "Message dans l'app", showPhone: "Afficher le téléphone", call: "Appeler", whatsapp: "WhatsApp", directions: "Itinéraire",
        approxNote: "La position affichée est approximative pour protéger la vie privée; l'adresse exacte se convient au contact.",
        report: "Signaler ce profil", reportReview: "Signaler cet avis", reportReason: "Motif du signalement",
        reportSubmit: "Envoyer le signalement", reportSent: "Signalement envoyé", reportOptNote: "Détails supplémentaires (facultatif)",
        reasonInfo: "Information erronée", reasonBehavior: "Comportement inapproprié", reasonScam: "Arnaque", reasonOther: "Autre",
        chatPh: "Écrivez votre message…", send: "Envoyer", chatAutoReply: "Merci pour votre message, je vous réponds bientôt.",
        reviewHint1: "Merci, vous avez déjà noté cet enseignant.",
        reviewHint2: "Vous pourrez noter l'enseignant après l'avoir contacté via message ou téléphone. Cela évite les faux avis.",
        rateBtn: "Noter cet enseignant", yourRating: "Votre note", yourName: "Nom (facultatif)", yourLevel: "Niveau",
        yourComment: "Votre commentaire", commentPh: "Comment se sont passés les cours ?", postReview: "Publier l'avis", starsErr: "Choisissez un nombre d'étoiles.",
        reviewPosted: "Avis publié", packLabel: "Forfait",
        myCurrentLocation: "Ma position actuelle", mapPoint: "Point sur la carte",
    },
};
/* ---------------- helpers ---------------- */
function distanceKm(a, b) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtDist = (d) => (d < 10 ? d.toFixed(1) : Math.round(d).toString());
const fmtPhone = (p) => p.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3");
const fmtDate = (s) => { const d = new Date(s); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
const displayPos = (t) => (t.type === "center" ? { lat: t.lat, lng: t.lng } : { lat: Math.round(t.lat * 250) / 250, lng: Math.round(t.lng * 250) / 250 });
const weighted = (r) => (r ? (r.sum + 3.5 * 3) / (r.n + 3) : 0);
const refCode = (id) => "QR-" + id.slice(-5).toUpperCase();
const plusDays = (n) => new Date(Date.now() + n * 86400000).toISOString();
const initials = (name) => { const parts = name.trim().split(/\s+/); return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || ""); };
const avatarColor = (id) => { let h = 0; for (const c of id)
    h = (h * 31 + c.charCodeAt(0)) % 997; return AVATAR_COLORS[h % AVATAR_COLORS.length]; };
/* ---------------- map ---------------- */
let leafletPromise = null;
let tilesBlocked = false;
function loadLeaflet() {
    if (window.L)
        return Promise.resolve(window.L);
    if (leafletPromise)
        return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "./vendor/leaflet.css";
        document.head.appendChild(css);
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        s.onload = () => (window.L ? resolve(window.L) : reject(new Error("no L")));
        s.onerror = () => reject(new Error("load failed"));
        document.head.appendChild(s);
        setTimeout(() => reject(new Error("timeout")), 9000);
    });
    return leafletPromise;
}
function MapView({ center, radiusKm, markers = [], onPick, onMarker, height = 340, zoom = 14 }) {
    const box = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const pickRef = useRef(onPick);
    const markRef = useRef(onMarker);
    pickRef.current = onPick;
    markRef.current = onMarker;
    const [mode, setMode] = useState(tilesBlocked ? "fallback" : "loading");
    useEffect(() => {
        if (tilesBlocked)
            return;
        let cancelled = false;
        loadLeaflet()
            .then((L) => {
            if (cancelled || !box.current)
                return;
            const map = L.map(box.current, { zoomControl: true }).setView([center.lat, center.lng], zoom);
            const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
            let ok = false;
            tiles.on("tileload", () => { ok = true; });
            setTimeout(() => {
                if (!ok && !cancelled && mapRef.current) {
                    tilesBlocked = true;
                    mapRef.current.remove();
                    mapRef.current = null;
                    setMode("fallback");
                }
            }, 7000);
            map.on("click", (e) => pickRef.current && pickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
            layerRef.current = L.layerGroup().addTo(map);
            mapRef.current = map;
            setMode("leaflet");
        })
            .catch(() => { if (!cancelled) {
            tilesBlocked = true;
            setMode("fallback");
        } });
        return () => { cancelled = true; if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        } };
    }, []);
    useEffect(() => {
        const L = window.L;
        const map = mapRef.current;
        const layer = layerRef.current;
        if (mode !== "leaflet" || !map || !layer)
            return;
        map.invalidateSize();
        layer.clearLayers();
        markers.forEach((m) => {
            const mk = L.marker([m.lat, m.lng], {
                icon: L.divIcon({ className: "", html: `<div class="pin${m.featured ? " f" : ""}">${m.label}</div>`, iconSize: [48, 24], iconAnchor: [24, 24] }),
                title: m.title,
            });
            mk.on("click", () => markRef.current && markRef.current(m.id));
            mk.addTo(layer);
        });
        const me = L.marker([center.lat, center.lng], {
            icon: L.divIcon({ className: "", html: '<div class="me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }),
            draggable: !!pickRef.current,
            zIndexOffset: 1000,
        });
        me.on("dragend", (e) => { const p = e.target.getLatLng(); pickRef.current && pickRef.current({ lat: p.lat, lng: p.lng }); });
        me.addTo(layer);
        if (radiusKm) {
            const c = L.circle([center.lat, center.lng], { radius: radiusKm * 1000, color: "#C73A3F", weight: 1.5, dashArray: "5 5", fillOpacity: 0.04 }).addTo(layer);
            map.fitBounds(c.getBounds(), { padding: [8, 8] });
        }
        else {
            map.setView([center.lat, center.lng], Math.max(map.getZoom(), zoom));
        }
    }, [mode, center.lat, center.lng, radiusKm, markers]);
    if (mode === "fallback")
        return _jsx(SketchMap, { center: center, radiusKm: radiusKm, markers: markers, onPick: onPick, onMarker: onMarker, height: height });
    return (_jsxs("div", { className: "mapbox", style: { height }, children: [_jsx("div", { ref: box, style: { position: "absolute", inset: 0 } }), mode === "loading" && _jsx("div", { className: "maploading", children: "\u2026" })] }));
}
function SketchMap({ center, radiusKm, markers, onPick, onMarker, height }) {
    const svgRef = useRef(null);
    const S = (radiusKm || 1.5) * 1.12;
    const kx = 111.32 * Math.cos((center.lat * Math.PI) / 180);
    const ky = 110.57;
    const proj = (p) => ({ x: (p.lng - center.lng) * kx, y: -(p.lat - center.lat) * ky });
    const click = (e) => {
        if (!onPick || !svgRef.current)
            return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const p = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        onPick({ lat: center.lat - p.y / ky, lng: center.lng + p.x / kx });
    };
    const step = S / 6;
    const lines = [];
    for (let i = -8; i <= 8; i++)
        lines.push(i * step);
    const r = S * 0.03;
    return (_jsxs("div", { className: "mapbox", style: { height }, children: [_jsxs("svg", { ref: svgRef, viewBox: `${-S} ${-S} ${2 * S} ${2 * S}`, preserveAspectRatio: "xMidYMid slice", width: "100%", height: "100%", onClick: click, role: "img", "aria-label": "\u062E\u0631\u064A\u0637\u0629 \u0645\u0628\u0633\u0651\u0637\u0629", children: [_jsx("rect", { x: -S * 3, y: -S * 3, width: S * 6, height: S * 6, fill: "#FAFBF8" }), lines.map((v) => _jsx("line", { x1: -S * 3, x2: S * 3, y1: v, y2: v, stroke: "#CCDAF0", strokeWidth: "1", vectorEffect: "non-scaling-stroke" }, "h" + v)), lines.map((v) => _jsx("line", { y1: -S * 3, y2: S * 3, x1: v, x2: v, stroke: "#E4ECF8", strokeWidth: "1", vectorEffect: "non-scaling-stroke" }, "v" + v)), radiusKm && _jsx("circle", { cx: "0", cy: "0", r: radiusKm, fill: "rgba(199,58,63,.04)", stroke: "#C73A3F", strokeWidth: "1.5", strokeDasharray: "5 5", vectorEffect: "non-scaling-stroke" }), markers.map((m) => {
                        const p = proj(m);
                        return (_jsxs("g", { onClick: (e) => { e.stopPropagation(); onMarker && onMarker(m.id); }, style: { cursor: "pointer" }, children: [_jsx("title", { children: m.title }), _jsx("rect", { x: p.x - r * 2.6, y: p.y - r * 2.4, width: r * 5.2, height: r * 2.4, rx: r * 0.5, fill: m.featured ? "#F7E26B" : "#fff", stroke: "#1D3B8C", strokeWidth: "1.5", vectorEffect: "non-scaling-stroke" }), _jsx("text", { x: p.x, y: p.y - r * 0.8, fontSize: r * 1.4, textAnchor: "middle", fill: "#1D3B8C", fontWeight: "600", children: m.label })] }, m.id));
                    }), _jsx("circle", { cx: "0", cy: "0", r: r * 0.9, fill: "#C73A3F", stroke: "#fff", strokeWidth: "3", vectorEffect: "non-scaling-stroke" })] }), _jsx("div", { className: "sketchnote", children: "\u062E\u0631\u064A\u0637\u0629 \u0645\u0628\u0633\u0651\u0637\u0629: \u062A\u0639\u0630\u0651\u0631 \u062A\u062D\u0645\u064A\u0644 \u062E\u0631\u064A\u0637\u0629 OpenStreetMap \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629." })] }));
}
function Stars({ value, size = 14 }) {
    return (_jsx("span", { className: "stars", "aria-label": `${value.toFixed(1)} / 5`, children: [1, 2, 3, 4, 5].map((i) => _jsx(Star, { size: size, fill: i <= Math.round(value) ? "currentColor" : "none" }, i)) }));
}
function Avatar({ t, size = 34 }) {
    return (_jsx("div", { className: "avatar", style: { width: size, height: size, fontSize: size * 0.4, background: avatarColor(t.id) }, "aria-hidden": "true", children: initials(t.name) }));
}
/* ---------------- CSS ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
.q{--paper:#FAFBF8;--ink:#1D3B8C;--rule:#CCDAF0;--margin:#C73A3F;--text:#23272F;--muted:#5F6673;--hl:#F7E26B;--wa:#1E8A4A;--star:#D99A06;--shadow:rgba(29,59,140,.12);--shadowSoft:rgba(29,59,140,.06);
font-family:'IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif;color:var(--text);background:var(--paper);min-height:100vh;direction:rtl}
.q *{box-sizing:border-box}
.q :focus-visible{outline:2.5px solid var(--margin);outline-offset:2px}
.wrap{max-width:520px;margin:0 auto;padding-bottom:96px}
.head{position:relative;padding:10px 66px 10px 18px;background-image:repeating-linear-gradient(to bottom,transparent 0 31px,var(--rule) 31px 32px)}
.head::before{content:"";position:absolute;top:0;bottom:0;right:48px;width:2px;background:var(--margin);opacity:.8}
.head::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:linear-gradient(90deg,var(--hl),transparent 75%)}
.brand{font-family:'Aref Ruqaa',serif;font-size:44px;line-height:60px;color:var(--ink);margin:0;font-weight:700;display:flex;align-items:center;gap:10px}
.brandmark{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(29,59,140,.08);color:var(--ink);flex:none}
.tag{margin:2px 0 0;font-size:15px;line-height:26px;color:var(--muted);padding-left:54px}
.langbtn{position:absolute;left:12px;top:12px;display:flex;align-items:center;gap:5px;background:#fff;border:1px solid var(--rule);border-radius:999px;padding:6px 11px;font:600 12px 'IBM Plex Sans Arabic',sans-serif;color:var(--ink);cursor:pointer;box-shadow:0 1px 3px var(--shadowSoft)}
.loc{display:flex;gap:8px;align-items:center;padding:12px 18px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);background:#fff}
.sel,.input{border:1px solid #C9CFDA;border-radius:8px;padding:9px 10px;font:inherit;font-size:15px;background:#fff;color:var(--text);width:100%}
.ghost{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--ink);color:var(--ink);background:transparent;border-radius:8px;padding:8px 12px;font:inherit;font-weight:600;font-size:14px;white-space:nowrap;cursor:pointer;transition:background .15s ease}
.ghost:hover{background:rgba(29,59,140,.06)}
.ghost:disabled{opacity:.6}
.note{padding:8px 18px 0;font-size:13px;color:var(--margin)}
.chips{display:flex;gap:8px;overflow-x:auto;padding:14px 18px 6px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.wrapchips{display:flex;flex-wrap:wrap;gap:8px}
.chip{flex:none;border:1px solid var(--rule);background:#fff;color:var(--text);border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer}
.chip[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff;box-shadow:0 2px 6px var(--shadow)}
.filters{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 18px 4px}
.filters label{font-size:12px;color:var(--muted);display:block;margin-bottom:4px}
.filters .sel{font-size:14px;padding:8px 6px}
.bar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 18px;flex-wrap:wrap}
.count{font-size:14px;color:var(--muted)}
.barRight{display:flex;gap:8px;align-items:center;flex:none}
.seg{display:inline-flex;border:1.5px solid var(--ink);border-radius:8px;overflow:hidden;flex:none}
.seg button{background:#fff;color:var(--ink);border:0;padding:6px 12px;font:inherit;font-size:14px;display:flex;gap:5px;align-items:center;cursor:pointer}
.seg button[aria-pressed=true]{background:var(--ink);color:#fff}
.iconbtn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--rule);background:#fff;color:var(--text);border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;cursor:pointer}
.list{border-top:1px solid var(--rule);background:#fff}
.row{display:grid;grid-template-columns:62px 1fr auto;width:100%;text-align:right;background:none;border:0;border-bottom:1px solid var(--rule);padding:0;font:inherit;color:inherit;cursor:pointer;transition:background .15s ease}
.row:hover{background:#F4F7FD}
.row:active{background:#EBF0FA}
.mar{background:rgba(199,58,63,.05);border-left:2px solid var(--margin);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 4px;color:var(--margin)}
.mar b{font-family:'Aref Ruqaa',serif;font-size:24px;line-height:1.1}
.mar span{font-size:11px}
.body{padding:12px 14px;min-width:0}
.namerow{display:flex;align-items:center;gap:8px}
.avatar{border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none}
.name{font-weight:600;font-size:16px}
.hl{background:linear-gradient(transparent 38%,var(--hl) 38% 92%,transparent 92%);padding:0 4px;font-size:13px;font-weight:600;white-space:nowrap}
.badgerow{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap}
.badge{display:inline-flex;align-items:center;gap:3px;font-size:11px;border-radius:6px;padding:2px 6px;font-weight:600}
.badge.v{background:#E7F5EC;color:var(--wa)}
.badge.p{background:#E7EEFB;color:var(--ink)}
.meta{font-size:13px;color:var(--muted);margin-top:2px}
.subs{font-size:14px;color:var(--ink);margin-top:6px}
.rate{display:flex;align-items:center;gap:4px;font-size:13px;margin-top:5px;font-weight:600}
.rate svg{color:var(--star)}
.rate span{color:var(--muted);font-weight:400}
.price{padding:12px 14px;text-align:left;align-self:stretch;display:flex;flex-direction:column;justify-content:center;white-space:nowrap;background:#FFFBF0;border-left:2px dashed #E7DDB0}
.price b{font-size:20px;display:block}
.price small{font-size:11px;color:var(--muted)}
.empty{padding:28px 18px;text-align:center;color:var(--muted);line-height:1.8}
.demo{padding:16px 18px;font-size:12px;color:var(--muted);line-height:1.7}
.mapbox{position:relative;z-index:0;direction:ltr;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);background:#EEF2F8;overflow:hidden}
.maploading{position:absolute;inset:0;display:grid;place-items:center;color:var(--muted);font-size:14px}
.sketchnote{position:absolute;bottom:0;left:0;right:0;background:rgba(255,255,255,.9);font-size:11px;color:var(--muted);padding:4px 10px;direction:rtl;text-align:right}
.maphint{font-size:12px;color:var(--muted);padding:8px 18px 4px;line-height:1.6}
.pin{background:#fff;border:1.5px solid var(--ink);color:var(--ink);border-radius:6px;font:600 12px 'IBM Plex Sans Arabic',sans-serif;text-align:center;line-height:21px;height:24px;width:48px;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.pin.f{background:var(--hl);border-color:#7A6700;color:#3B3200}
.me{width:20px;height:20px;border-radius:50%;background:var(--margin);border:3px solid #fff;box-shadow:0 0 0 2px var(--margin)}
.overlay{position:fixed;inset:0;background:rgba(20,28,50,.45);display:flex;align-items:flex-end;justify-content:center;z-index:1100}
.sheet{background:var(--paper);width:100%;max-width:520px;max-height:90vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 20px 26px;animation:up .22s ease-out;position:relative;box-shadow:0 -8px 28px rgba(29,59,140,.18)}
@keyframes up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.sheet{animation:none}}
.close{position:absolute;left:14px;top:14px;background:#fff;border:1px solid var(--rule);border-radius:999px;width:36px;height:36px;display:grid;place-items:center;cursor:pointer;color:var(--text)}
.sheet h2{font-size:22px;margin:4px 0 2px;padding-left:44px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bio{line-height:1.8;font-size:15px;margin:14px 0;padding:10px 14px;border-right:3px solid var(--rule);background:#fff}
.kv{display:grid;grid-template-columns:90px 1fr;gap:8px 12px;font-size:14px;margin:10px 0 0}
.kv dt{color:var(--muted)}
.kv dd{margin:0}
.approx{font-size:12px;color:var(--muted);margin-top:10px}
.actions{display:grid;gap:10px;margin-top:18px}
.actions.two{grid-template-columns:1fr 1fr}
.actions.three{grid-template-columns:1fr 1fr 1fr}
.act{display:flex;align-items:center;justify-content:center;gap:6px;padding:13px 6px;border-radius:10px;font-weight:600;text-decoration:none;font-size:15px;color:#fff;border:0;font-family:inherit;cursor:pointer}
.act.call{background:var(--ink)}
.act.wa{background:var(--wa)}
.act.dir{background:#fff;color:var(--ink);border:1.5px solid var(--ink)}
.act.chat{background:var(--ink)}
.act.reveal{background:#fff;color:var(--ink);border:1.5px solid var(--ink)}
.stars{display:inline-flex;gap:1px;color:var(--star);vertical-align:middle}
.chatbox{border:1px solid var(--rule);background:#fff;margin-top:14px;padding:10px}
.bubble{max-width:80%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.6;margin-bottom:8px}
.bubble.me{background:var(--ink);color:#fff;margin-left:auto;border-bottom-left-radius:3px}
.bubble.them{background:#EEF2F8;color:var(--text);margin-right:auto;border-bottom-right-radius:3px}
.composer{display:flex;gap:8px;margin-top:8px}
.composer input{flex:1}
.composer button{flex:none;background:var(--ink);color:#fff;border:0;border-radius:8px;padding:0 14px;display:flex;align-items:center;cursor:pointer}
.linkbtn{background:none;border:0;color:var(--margin);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer;padding:6px 0}
.reportform{background:#fff;border:1px dashed var(--margin);padding:12px;margin-top:8px}
.revhead{display:flex;align-items:center;gap:12px;margin:22px 0 6px;padding-top:16px;border-top:1px solid var(--rule)}
.revhead b{font-size:32px;color:var(--ink);line-height:1}
.revhead .meta{margin:0}
.rev{padding:10px 0;border-bottom:1px solid var(--rule);font-size:14px;line-height:1.7}
.rev .top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
.rev .top span{color:var(--muted);font-size:12px;display:flex;align-items:center;gap:6px}
.rev .flag{background:none;border:0;color:var(--muted);cursor:pointer;padding:2px}
.rev p{margin:4px 0 0}
.hint{font-size:13px;color:var(--muted);background:#fff;border:1px dashed #B9C8E4;padding:10px 12px;margin-top:12px;line-height:1.7}
.rform{background:#fff;border:1px solid var(--rule);padding:14px;margin-top:12px}
.starpick{display:flex;gap:2px;margin-bottom:10px}
.starpick button{background:none;border:0;padding:4px;cursor:pointer;color:var(--star)}
.page{padding:18px}
.h2{font-family:'Aref Ruqaa',serif;font-size:28px;color:var(--ink);margin:0 0 4px;font-weight:700}
.lead{color:var(--muted);font-size:14px;margin:0 0 18px;line-height:1.7}
.field{margin-bottom:16px}
.lb{display:block;font-weight:600;font-size:14px;margin-bottom:6px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.decl{display:flex;gap:10px;align-items:flex-start;background:#FFF5F5;border-right:3px solid var(--margin);padding:12px;font-size:14px;line-height:1.7;margin-bottom:16px}
.termsList{margin:10px 0;padding-inline-start:20px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.7}
.errs{color:var(--margin);font-size:14px;margin:0 0 14px;padding-right:18px;line-height:1.8}
.primary{width:100%;background:var(--ink);color:#fff;border:0;border-radius:10px;padding:14px;font:inherit;font-weight:600;font-size:16px;cursor:pointer;box-shadow:0 3px 10px var(--shadow);transition:transform .1s ease}
.primary:active{transform:translateY(1px)}
.bleed{margin:0 -18px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--rule);background:#fff;margin-bottom:22px;box-shadow:0 1px 4px var(--shadowSoft)}
.stats div{padding:12px 8px;text-align:center;border-left:1px solid var(--rule)}
.stats div:last-child{border-left:0}
.stats b{display:block;font-size:24px;color:var(--ink)}
.stats span{font-size:12px;color:var(--muted)}
.calc{background:#fff;border:1px solid var(--rule);padding:16px;margin-bottom:22px;box-shadow:0 1px 4px var(--shadowSoft)}
.range{width:100%;accent-color:var(--ink)}
.result{border-top:2px solid var(--margin);margin-top:14px;padding-top:12px}
.result b{font-size:30px;color:var(--ink)}
.result p{margin:4px 0 0;font-size:13px;color:var(--muted);line-height:1.7}
.mini{list-style:none;margin:0 0 22px;padding:0;background:#fff;border-top:1px solid var(--rule);box-shadow:0 1px 4px var(--shadowSoft)}
.mini li{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--rule);font-size:14px;gap:8px}
.mini small{display:block;color:var(--muted);font-size:12px;line-height:1.6}
.mini .rowbtns{display:flex;gap:6px;flex:none}
.mini .rowbtns button{font-size:12px;padding:5px 8px;border-radius:6px;border:1px solid var(--rule);background:#fff;cursor:pointer;white-space:nowrap}
.icon{background:none;border:0;color:var(--margin);cursor:pointer;padding:6px;display:grid;place-items:center;flex:none}
.h3{font-size:16px;font-weight:600;margin:24px 0 8px}
.h3:first-child{margin-top:0}
.danger{background:none;border:1.5px solid var(--margin);color:var(--margin);border-radius:10px;padding:11px;width:100%;font:inherit;font-weight:600;cursor:pointer}
.nav{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid var(--rule);display:flex;justify-content:center;z-index:1000;box-shadow:0 -3px 12px var(--shadowSoft)}
.nav-in{display:grid;grid-template-columns:repeat(4,1fr);width:100%;max-width:520px}
.nav button{position:relative;background:none;border:0;padding:9px 2px 12px;font:inherit;font-size:12px;color:var(--muted);display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer}
.nav button[aria-current=page]{color:var(--ink);font-weight:600}
.nav button[aria-current=page]::before{content:"";position:absolute;top:0;right:50%;transform:translateX(50%);width:26px;height:3px;border-radius:0 0 3px 3px;background:var(--ink)}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--text);color:#fff;padding:10px 18px;border-radius:999px;font-size:14px;z-index:1200;white-space:nowrap;max-width:90%;text-align:center}
.rolewrap{margin-bottom:18px}
.card{background:#fff;border:1px solid var(--rule);padding:14px;margin-bottom:16px;box-shadow:0 1px 4px var(--shadowSoft)}
.gate{background:#fff;border:1px solid var(--rule);padding:20px;text-align:center;margin-top:20px;box-shadow:0 1px 4px var(--shadowSoft)}
.gate svg{color:var(--ink);margin-bottom:8px}
.planpick{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.plancard{border:1.5px solid var(--rule);border-radius:10px;padding:12px;text-align:center;background:#fff;cursor:pointer;font:inherit}
.plancard[aria-pressed=true]{border-color:var(--ink);background:#EEF2FB}
.plancard b{display:block;font-size:20px;color:var(--ink)}
.plancard span{font-size:12px;color:var(--muted)}
.paybtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.paybtn{border:1.5px solid var(--rule);background:#fff;border-radius:10px;padding:12px;font:600 14px inherit;cursor:pointer}
.badgebig{display:inline-flex;align-items:center;gap:6px;background:#E7F5EC;color:var(--wa);border-radius:8px;padding:8px 12px;font-weight:600;font-size:14px}
.refcode{font-family:monospace;font-size:20px;letter-spacing:1px;background:#EEF2FB;border-radius:8px;padding:8px 12px;display:inline-block}
.leaflet-container{font-family:'IBM Plex Sans Arabic',sans-serif}
`;
/* ---------------- component ---------------- */
const EMPTY_FORM = { name: "", type: "grad", gender: "", phone: "", subjects: [], levels: [], modes: [], price: "", city: "تونس العاصمة", area: "", bio: "", packSessions: "", packPrice: "", refBy: "", declared: false, lat: null, lng: null };
const EMPTY_REVIEW = { stars: 0, name: "", level: "", text: "" };
const EMPTY_REPORT = { reason: "reasonInfo", note: "" };
/* Shared backend: Firestore, so every visitor (admin + teachers + students) reads
   and writes the same data, instead of each browser having its own isolated copy. */
const firebaseConfig = {
    apiKey: "AIzaSyCqyhz_X-tuhT8WYn6LN_3epP5lA_6ZTLQ",
    authDomain: "aalimni-48a28.firebaseapp.com",
    projectId: "aalimni-48a28",
    storageBucket: "aalimni-48a28.firebasestorage.app",
    messagingSenderId: "470602788870",
    appId: "1:470602788870:web:6f25c54ac682073fa5d387",
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const storage = {
    async get(key) {
        const snap = await getDoc(doc(db, "appdata", key));
        if (!snap.exists())
            return null;
        return { key, value: snap.data().value };
    },
    async set(key, value) {
        await setDoc(doc(db, "appdata", key), { value, updatedAt: Date.now() });
        return { key, value };
    },
};
export default function App() {
    const [tab, setTab] = useState("search");
    const [data, setData] = useState(INITIAL);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const L = STR[data.lang] || STR.ar;
    const lang = data.lang;
    const sep = lang === "fr" ? ", " : "، ";
    const trSubject = (s) => (lang === "fr" ? SUBJECT_FR[s] || s : s);
    const trLevel = (l) => (lang === "fr" ? LEVEL_FR[l] || l : l);
    const trMode = (m) => (lang === "fr" ? MODE_FR[m] || m : m);
    const trType = (code) => (lang === "fr" ? TYPE_FR[code] || code : TYPES[code]);
    const trCity = (name) => (lang === "fr" ? CITY_FR[name] || name : name);
    const [loc, setLoc] = useState({ ...CITIES[0], label: "تونس العاصمة" });
    const [locNote, setLocNote] = useState("");
    const [locating, setLocating] = useState(false);
    const [subject, setSubject] = useState(null);
    const [level, setLevel] = useState("");
    const [radius, setRadius] = useState(10);
    const [sort, setSort] = useState("near");
    const [genderFilter, setGenderFilter] = useState(null);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [view, setView] = useState("list");
    const [selected, setSelected] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatText, setChatText] = useState("");
    const [phoneRevealed, setPhoneRevealed] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [report, setReport] = useState(EMPTY_REPORT);
    const [showReview, setShowReview] = useState(false);
    const [draft, setDraft] = useState(EMPTY_REVIEW);
    const [draftErr, setDraftErr] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState([]);
    const [termsOpen, setTermsOpen] = useState(false);
    const [subPrice, setSubPrice] = useState(50);
    const [featPrice, setFeatPrice] = useState(20);
    const [target, setTarget] = useState(150);
    const [featShare, setFeatShare] = useState(15);
    const [role, setRole] = useState("parent");
    const [childName, setChildName] = useState("");
    const [childLevel, setChildLevel] = useState(LEVELS[0]);
    const [dashPhone, setDashPhone] = useState("");
    const [dashTeacherId, setDashTeacherId] = useState(null);
    const [dashErr, setDashErr] = useState("");
    const [otpStage, setOtpStage] = useState("idle");
    const [otpCode, setOtpCode] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [otpErr, setOtpErr] = useState("");
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentPlan, setPaymentPlan] = useState("basic");
    const [ownerUnlocked, setOwnerUnlocked] = useState(false);
    const [ownerPassInput, setOwnerPassInput] = useState("");
    const [ownerPassInput2, setOwnerPassInput2] = useState("");
    const [ownerErr, setOwnerErr] = useState("");
    useEffect(() => {
        (async () => {
            try {
                const r = await storage.get("aalimni-data");
                if (r && r.value)
                    setData({ ...INITIAL, ...JSON.parse(r.value) });
            }
            catch (e) { /* no saved data yet */ }
            setLoading(false);
        })();
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const subscribed = params.get("subscribed");
        const tId = params.get("teacherId");
        if (!subscribed)
            return;
        window.history.replaceState({}, "", window.location.pathname);
        if (tId) {
            setTab("account");
            setRole("teacher");
            setDashTeacherId(tId);
            const backend = (window.__BACKEND_URL__ || "");
            if (backend) {
                fetch(`${backend}/api/subscription/${tId}`)
                    .then((r) => r.json())
                    .then((sub) => { if (sub && sub.active)
                    update((d) => ({ ...d, subscriptions: { ...d.subscriptions, [tId]: sub } })); })
                    .catch(() => { });
            }
        }
        setToast(subscribed === "1" ? L.paySuccess : L.payFailed);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!toast)
            return;
        const t = setTimeout(() => setToast(""), 2600);
        return () => clearTimeout(t);
    }, [toast]);
    const save = async (d) => { try {
        await storage.set("aalimni-data", JSON.stringify(d));
    }
    catch (e) {
        console.error("Storage error:", e);
    } };
    const update = (fn) => setData((prev) => { const next = fn(prev); save(next); return next; });
    const all = useMemo(() => [...SEED, ...data.registered], [data.registered]);
    const ratings = useMemo(() => {
        const m = {};
        data.reviews.forEach((r) => { m[r.tid] = m[r.tid] || { sum: 0, n: 0 }; m[r.tid].sum += r.stars; m[r.tid].n += 1; });
        return m;
    }, [data.reviews]);
    const isSubscribed = (id) => { const s = data.subscriptions[id]; return !!(s && s.active && new Date(s.until) > new Date()); };
    const isFeaturedNow = (id) => { const s = data.subscriptions[id]; return isSubscribed(id) && s.plan === "featured"; };
    const isVerified = (id) => data.verifications[id] === "verified";
    const isPhoneVerified = (id) => !!data.phoneVerified[id];
    const isListable = (id) => !data.registered.some((x) => x.id === id) || isSubscribed(id);
    const runFilter = (list, f) => list
        .map((t) => { const p = displayPos(t); return { ...t, pLat: p.lat, pLng: p.lng, dist: distanceKm(loc, p) }; })
        .filter((t) => t.dist <= f.radius)
        .filter((t) => !f.subject || t.subjects.includes(f.subject))
        .filter((t) => !f.level || t.levels.includes(f.level))
        .filter((t) => !f.gender || t.type === "center" || t.gender === f.gender)
        .filter((t) => !f.verifiedOnly || isVerified(t.id))
        .filter((t) => isListable(t.id));
    const results = useMemo(() => {
        const list = runFilter(all, { radius, subject, level, gender: genderFilter, verifiedOnly });
        return list.sort((a, b) => {
            const f = (isFeaturedNow(b.id) ? 1 : 0) - (isFeaturedNow(a.id) ? 1 : 0);
            if (f)
                return f;
            if (sort === "rating")
                return weighted(ratings[b.id]) - weighted(ratings[a.id]) || a.dist - b.dist;
            return a.dist - b.dist;
        });
        // eslint-disable-next-line
    }, [all, loc, radius, subject, level, sort, genderFilter, verifiedOnly, ratings, data.subscriptions]);
    const mapMarkers = useMemo(() => results.map((t) => ({ id: t.id, lat: t.pLat, lng: t.pLng, label: `${t.price} د`, featured: isFeaturedNow(t.id), title: t.name })), [results, data.subscriptions]);
    const geolocate = (onOk) => {
        setLocNote("");
        if (!navigator.geolocation) {
            setLocNote("المتصفح لا يدعم تحديد الموقع. اختر مدينتك من القائمة أو اضغط على الخريطة.");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition((p) => { onOk({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); }, () => { setLocNote("تعذّر تحديد موقعك. اختر مدينتك من القائمة أو اضغط على الخريطة."); setLocating(false); }, { timeout: 8000, enableHighAccuracy: true });
    };
    const pickCity = (name) => { const c = CITIES.find((x) => x.name === name); if (c)
        setLoc({ ...c, label: c.name }); setLocNote(""); };
    const openTeacher = (t) => {
        setSelected(t);
        setChatOpen(false);
        setChatText("");
        setPhoneRevealed(false);
        setReportOpen(false);
        setReport(EMPTY_REPORT);
        setShowReview(false);
        setDraft(EMPTY_REVIEW);
        setDraftErr("");
        update((d) => ({ ...d, views: { ...d.views, [t.id]: (d.views[t.id] || 0) + 1 } }));
    };
    const openTeacherChat = (t) => { openTeacher(t); setChatOpen(true); };
    const previewTeacher = (t) => { setSelected(t); setChatOpen(false); setChatText(""); setPhoneRevealed(false); setReportOpen(false); setReport(EMPTY_REPORT); setShowReview(false); setDraft(EMPTY_REVIEW); setDraftErr(""); };
    const recordContact = (id) => update((d) => ({ ...d, contacts: { ...d.contacts, [id]: (d.contacts[id] || 0) + 1 } }));
    const sendChat = () => {
        if (!chatText.trim() || !selected)
            return;
        const msg = { from: "me", text: chatText.trim(), date: new Date().toISOString() };
        update((d) => ({ ...d, messages: { ...d.messages, [selected.id]: [...(d.messages[selected.id] || []), msg] } }));
        setChatText("");
        setTimeout(() => {
            update((d) => ({ ...d, messages: { ...d.messages, [selected.id]: [...(d.messages[selected.id] || []), { from: "them", text: L.chatAutoReply, date: new Date().toISOString() }] } }));
        }, 1100);
    };
    const revealPhone = () => { setPhoneRevealed(true); if (selected)
        recordContact(selected.id); };
    const contacted = (id) => !!(data.contacts[id] > 0 || (data.messages[id] && data.messages[id].length));
    const submitReport = () => {
        const r = { id: "rp" + Date.now(), kind: reportTarget.kind, targetId: reportTarget.id, targetLabel: reportTarget.label, reason: report.reason, note: report.note.trim(), date: new Date().toISOString() };
        update((d) => ({ ...d, reports: [r, ...d.reports] }));
        setReportOpen(false);
        setReport(EMPTY_REPORT);
        setToast(L.reportSent);
    };
    const submitReview = () => {
        if (!draft.stars) {
            setDraftErr(L.starsErr);
            return;
        }
        const r = { id: "r" + Date.now(), tid: selected.id, name: draft.name.trim() || "تلميذ", stars: draft.stars, level: draft.level, text: draft.text.trim(), date: new Date().toISOString() };
        update((d) => ({ ...d, reviews: [r, ...d.reviews], reviewed: [...d.reviewed, selected.id] }));
        setShowReview(false);
        setDraft(EMPTY_REVIEW);
        setToast(L.reviewPosted);
    };
    const toggle = (key, val) => setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));
    const formCity = CITIES.find((c) => c.name === form.city) || CITIES[0];
    const formPos = form.lat != null ? { lat: form.lat, lng: form.lng } : { lat: formCity.lat, lng: formCity.lng };
    const publish = () => {
        const e = [];
        if (form.name.trim().length < 3)
            e.push(L.errName);
        if (!/^\d{8}$/.test(form.phone.replace(/\s/g, "")))
            e.push(L.errPhone);
        if (!form.subjects.length)
            e.push(L.errSubjects);
        if (!form.levels.length)
            e.push(L.errLevels);
        if (!form.modes.length)
            e.push(L.errModes);
        if (!(Number(form.price) > 0))
            e.push(L.errPrice);
        if (form.lat == null)
            e.push(L.errMap);
        if (form.type !== "center" && !form.gender)
            e.push(L.errGender);
        if ((form.packSessions && !form.packPrice) || (!form.packSessions && form.packPrice))
            e.push(L.errPack);
        if (!form.declared)
            e.push(L.errDeclare);
        setErrors(e);
        if (e.length)
            return;
        const id = "u" + Date.now();
        const t = {
            id, name: form.name.trim(), type: form.type, gender: form.type === "center" ? null : form.gender,
            phone: form.phone.replace(/\s/g, ""), subjects: form.subjects, levels: form.levels, modes: form.modes,
            price: Number(form.price), unit: form.type === "center" ? "شهر" : "ساعة", area: form.area.trim() || form.city,
            lat: form.lat, lng: form.lng, bio: form.bio.trim(),
            pack: form.packSessions && form.packPrice ? { n: Number(form.packSessions), price: Number(form.packPrice) } : null,
        };
        update((d) => {
            let next = { ...d, registered: [...d.registered, t] };
            const code = form.refBy.trim().toUpperCase();
            if (code) {
                const referrer = [...d.registered, ...SEED].find((x) => refCode(x.id) === code && x.id !== id);
                if (referrer) {
                    const cur = next.subscriptions[referrer.id];
                    const base = cur && cur.active && new Date(cur.until) > new Date() ? new Date(cur.until) : new Date();
                    next = {
                        ...next,
                        subscriptions: { ...next.subscriptions, [referrer.id]: { active: true, plan: (cur && cur.plan) || "basic", until: new Date(base.getTime() + 7 * 86400000).toISOString() } },
                        referrals: { ...next.referrals, [referrer.id]: { count: ((next.referrals[referrer.id] || { count: 0 }).count) + 1 } },
                    };
                }
            }
            return next;
        });
        setForm(EMPTY_FORM);
        setErrors([]);
        setToast(L.published);
        setLoc({ lat: t.lat, lng: t.lng, label: t.area });
        setTab("search");
    };
    const addChild = () => {
        if (!childName.trim())
            return;
        update((d) => ({ ...d, children: [...d.children, { id: "c" + Date.now(), name: childName.trim(), level: childLevel }] }));
        setChildName("");
    };
    const removeChild = (id) => update((d) => ({ ...d, children: d.children.filter((c) => c.id !== id) }));
    const matchCountFor = (s) => runFilter(all, { radius: s.radius, subject: s.subject, level: s.level, gender: s.gender, verifiedOnly: false }).length;
    const saveSearch = () => {
        const label = [subject || L.allSubjects, level || L.allLevels, `${radius} ${L.km}`].join(" · ");
        const s = { id: "sv" + Date.now(), subject, level, gender: genderFilter, radius, label, savedCount: results.length };
        update((d) => ({ ...d, savedSearches: [s, ...d.savedSearches] }));
        setToast(L.saved);
    };
    const applySaved = (s) => { setSubject(s.subject); setLevel(s.level); setGenderFilter(s.gender); setRadius(s.radius); setTab("search"); setView("list"); };
    const removeSaved = (id) => update((d) => ({ ...d, savedSearches: d.savedSearches.filter((s) => s.id !== id) }));
    const messageThreads = useMemo(() => Object.keys(data.messages).filter((id) => data.messages[id] && data.messages[id].length).map((id) => {
        const t = all.find((x) => x.id === id);
        const arr = data.messages[id];
        return t ? { t, last: arr[arr.length - 1] } : null;
    }).filter(Boolean), [data.messages, all]);
    const lookupTeacher = () => {
        setDashErr("");
        setOtpStage("idle");
        setOtpInput("");
        setOtpErr("");
        const phone = dashPhone.replace(/\s/g, "");
        const t = all.find((x) => x.phone === phone);
        if (!t) {
            setDashErr(L.teacherNotFound);
            setDashTeacherId(null);
            return;
        }
        setDashTeacherId(t.id);
    };
    const dashTeacher = dashTeacherId ? all.find((t) => t.id === dashTeacherId) : null;
    const sendOtp = () => { setOtpCode(String(Math.floor(1000 + Math.random() * 9000))); setOtpStage("sent"); setOtpErr(""); };
    const confirmOtp = () => {
        if (otpInput.trim() === otpCode) {
            update((d) => ({ ...d, phoneVerified: { ...d.phoneVerified, [dashTeacherId]: true } }));
            setOtpStage("idle");
            setToast(L.otpOk);
        }
        else
            setOtpErr(L.otpWrong);
    };
    const requestVerify = () => update((d) => ({ ...d, verifications: { ...d.verifications, [dashTeacherId]: "pending" } }));
    const [payError, setPayError] = useState("");
    const goToPayment = async () => {
        setPayError("");
        const backend = (window.__BACKEND_URL__ || "");
        if (!backend) {
            setPayError(L.payNoBackend);
            return;
        }
        try {
            const res = await fetch(`${backend}/api/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: dashTeacherId, plan: paymentPlan }),
            });
            if (!res.ok)
                throw new Error("bad response");
            const data = await res.json();
            if (!data.link)
                throw new Error("no link");
            window.location.href = data.link; // vraie redirection vers la page de paiement Flouci
        }
        catch (e) {
            console.error(e);
            setPayError(L.payFailed);
        }
    };
    const shareReferral = async () => {
        const code = refCode(dashTeacherId);
        try {
            if (navigator.share)
                await navigator.share({ text: code });
            else {
                await navigator.clipboard.writeText(code);
                setToast(L.refCopied);
            }
        }
        catch (e) { /* cancelled */ }
    };
    const approveVerify = (id) => update((d) => ({ ...d, verifications: { ...d.verifications, [id]: "verified" } }));
    const rejectVerify = (id) => update((d) => ({ ...d, verifications: { ...d.verifications, [id]: "none" } }));
    const [approveDates, setApproveDates] = useState({});
    const [approvePaid, setApprovePaid] = useState({});
    const defaultApproveDate = (id) => { const existing = data.subscriptions[id]; if (existing && existing.until) return existing.until.slice(0, 10); const dt = new Date(Date.now() + (data.settings?.trialDays ?? 60) * 86400000); return dt.toISOString().slice(0, 10); };
    const getApproveDate = (id) => approveDates[id] || defaultApproveDate(id);
    const getApprovePaid = (id) => (id in approvePaid ? approvePaid[id] : !!(data.subscriptions[id] && data.subscriptions[id].paid));
    const approveUntil = (id) => update((d) => ({ ...d, subscriptions: { ...d.subscriptions, [id]: { active: true, plan: "basic", until: new Date(`${getApproveDate(id)}T23:59:59`).toISOString(), paid: getApprovePaid(id) } } }));
    const dismissReport = (id) => update((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) }));
    const deleteReviewFromReport = (rep) => update((d) => ({ ...d, reviews: d.reviews.filter((r) => r.id !== rep.targetId), reports: d.reports.filter((r) => r.id !== rep.id) }));
    const deleteFileFromReport = (rep) => update((d) => ({ ...d, registered: d.registered.filter((t) => t.id !== rep.targetId), reports: d.reports.filter((r) => r.id !== rep.id) }));
    const featuredCount = Math.round((target * featShare) / 100);
    const monthly = target * subPrice + featuredCount * featPrice;
    const totalContacts = Object.values(data.contacts).reduce((s, n) => s + n, 0);
    const realSubsCount = all.filter((t) => isSubscribed(t.id)).length;
    const topContacted = all.filter((t) => data.contacts[t.id]).sort((a, b) => data.contacts[b.id] - data.contacts[a.id]).slice(0, 5);
    const nameOf = (id) => (all.find((t) => t.id === id) || {}).name || "—";
    const latestReviews = [...data.reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    const pendingVerifications = all.filter((t) => data.verifications[t.id] === "pending");
    const setOwnerPassword = () => {
        if (!ownerPassInput || ownerPassInput.length < 4) {
            setOwnerErr("كلمة السر يجب أن تكون 4 خانات على الأقل.");
            return;
        }
        if (ownerPassInput !== ownerPassInput2) {
            setOwnerErr("كلمتا السر غير متطابقتين.");
            return;
        }
        update((d) => ({ ...d, ownerPass: ownerPassInput }));
        setOwnerUnlocked(true);
        setOwnerErr("");
    };
    const enterOwner = () => {
        if (ownerPassInput === data.ownerPass) {
            setOwnerUnlocked(true);
            setOwnerErr("");
        }
        else
            setOwnerErr(L.gateWrong);
    };
    const sel = selected;
    const selRating = sel ? ratings[sel.id] : null;
    const selReviews = sel ? data.reviews.filter((r) => r.tid === sel.id).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
    const alreadyReviewed = sel ? data.reviewed.includes(sel.id) : false;
    const selMessages = sel ? data.messages[sel.id] || [] : [];
    return (_jsxs("div", { className: "q", children: [_jsx("style", { children: CSS }), _jsxs("div", { className: "wrap", children: [tab === "search" && (_jsxs(_Fragment, { children: [_jsxs("header", { className: "head", children: [_jsxs("button", { className: "langbtn", onClick: () => update((d) => ({ ...d, lang: d.lang === "ar" ? "fr" : "ar" })), children: [_jsx(Globe, { size: 14 }), data.lang === "ar" ? "FR" : "عربي"] }), _jsxs("h1", { className: "brand", children: [_jsx("span", { className: "brandmark", children: _jsx(GraduationCap, { size: 30, strokeWidth: 2.2 }) }), L.brand] }), _jsx("p", { className: "tag", children: L.tagline })] }), _jsxs("div", { className: "loc", children: [_jsxs("select", { className: "sel", "aria-label": L.city, value: CITIES.some((c) => c.name === loc.label) ? loc.label : "", onChange: (e) => pickCity(e.target.value), children: [!CITIES.some((c) => c.name === loc.label) && _jsx("option", { value: "", children: loc.label }), CITIES.map((c) => _jsx("option", { value: c.name, children: trCity(c.name) }, c.name))] }), _jsxs("button", { className: "ghost", onClick: () => geolocate((p) => setLoc({ ...p, label: L.myCurrentLocation })), disabled: locating, children: [_jsx(LocateFixed, { size: 16 }), locating ? L.locating : L.locateMe] })] }), locNote && _jsx("div", { className: "note", role: "status", children: locNote }), _jsxs("div", { className: "chips", role: "group", "aria-label": L.subjects, children: [_jsx("button", { className: "chip", "aria-pressed": !subject, onClick: () => setSubject(null), children: L.allSubjects }), SUBJECTS.map((s) => _jsx("button", { className: "chip", "aria-pressed": subject === s, onClick: () => setSubject(subject === s ? null : s), children: trSubject(s) }, s))] }), _jsxs("div", { className: "filters", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "lvl", children: L.level }), _jsxs("select", { id: "lvl", className: "sel", value: level, onChange: (e) => setLevel(e.target.value), children: [_jsx("option", { value: "", children: L.allLevels }), LEVELS.map((l) => _jsx("option", { value: l, children: trLevel(l) }, l))] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "rad", children: L.distance }), _jsx("select", { id: "rad", className: "sel", value: radius, onChange: (e) => setRadius(Number(e.target.value)), children: RADII.map((r) => _jsxs("option", { value: r, children: [r, " ", L.km] }, r)) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "srt", children: L.sort }), _jsxs("select", { id: "srt", className: "sel", value: sort, onChange: (e) => setSort(e.target.value), children: [_jsx("option", { value: "near", children: L.sortNear }), _jsx("option", { value: "rating", children: L.sortRating })] })] })] }), _jsxs("div", { className: "chips", role: "group", "aria-label": L.gender, style: { paddingTop: 6 }, children: [_jsxs("button", { className: "chip", "aria-pressed": !genderFilter, onClick: () => setGenderFilter(null), children: [L.gender, ": ", L.genderAll] }), _jsx("button", { className: "chip", "aria-pressed": genderFilter === "m", onClick: () => setGenderFilter(genderFilter === "m" ? null : "m"), children: L.genderM }), _jsx("button", { className: "chip", "aria-pressed": genderFilter === "f", onClick: () => setGenderFilter(genderFilter === "f" ? null : "f"), children: L.genderF }), _jsxs("button", { className: "chip", "aria-pressed": verifiedOnly, onClick: () => setVerifiedOnly(!verifiedOnly), children: [_jsx(ShieldCheck, { size: 14, style: { verticalAlign: "-2px", marginLeft: 4 } }), L.verifiedOnly] })] }), _jsxs("div", { className: "bar", children: [_jsx("span", { className: "count", "aria-live": "polite", children: loading ? "…" : `${results.length} ${results.length === 1 ? L.results : L.results2} ${L.within} ${radius} ${L.km}` }), _jsxs("div", { className: "barRight", children: [_jsxs("button", { className: "iconbtn", onClick: saveSearch, children: [_jsx(Bell, { size: 14 }), L.saveSearch] }), _jsxs("div", { className: "seg", role: "group", "aria-label": L.view, children: [_jsxs("button", { "aria-pressed": view === "list", onClick: () => setView("list"), children: [_jsx(List, { size: 16 }), L.listView] }), _jsxs("button", { "aria-pressed": view === "map", onClick: () => setView("map"), children: [_jsx(MapIcon, { size: 16 }), L.mapView] })] })] })] }), view === "map" && (_jsxs(_Fragment, { children: [_jsx(MapView, { center: loc, radiusKm: radius, markers: mapMarkers, onPick: (p) => setLoc({ ...p, label: L.mapPoint }), onMarker: (id) => { const t = results.find((r) => r.id === id); if (t)
                                            openTeacher(t); }, height: 380 }), _jsx("p", { className: "maphint", children: L.mapHint })] })), view === "list" && (!loading && results.length === 0 ? (_jsxs("div", { className: "empty", children: [L.noResults, " ", radius, " ", L.km, ".", _jsx("br", {}), radius < 50 && _jsxs("button", { className: "ghost", style: { marginTop: 12 }, onClick: () => setRadius(RADII[RADII.indexOf(radius) + 1]), children: [L.widen, " ", RADII[RADII.indexOf(radius) + 1], " ", L.km] })] })) : (_jsx("div", { className: "list", children: results.map((t) => {
                                    const r = ratings[t.id];
                                    return (_jsxs("button", { className: "row", onClick: () => openTeacher(t), children: [_jsxs("div", { className: "mar", "aria-label": `${fmtDist(t.dist)} ${L.km}`, children: [_jsx("b", { children: fmtDist(t.dist) }), _jsx("span", { children: L.km })] }), _jsxs("div", { className: "body", children: [_jsxs("div", { className: "namerow", children: [_jsx(Avatar, { t: t, size: 30 }), _jsx("span", { className: "name", children: t.name }), isFeaturedNow(t.id) && _jsx("span", { className: "hl", children: L.featured })] }), _jsxs("div", { className: "badgerow", children: [isVerified(t.id) && _jsxs("span", { className: "badge v", children: [_jsx(ShieldCheck, { size: 11 }), L.verified] }), isPhoneVerified(t.id) && _jsxs("span", { className: "badge p", children: [_jsx(Check, { size: 11 }), L.phoneVerified] })] }), _jsxs("div", { className: "meta", children: [trType(t.type), sep, t.area] }), _jsx("div", { className: "subs", children: t.subjects.map(trSubject).join(sep) }), _jsx("div", { className: "rate", children: r ? (_jsxs(_Fragment, { children: [_jsx(Star, { size: 13, fill: "currentColor" }), (r.sum / r.n).toFixed(1), _jsxs("span", { children: ["(", r.n, " ", r.n > 10 ? L.ratingsWordMany : L.ratingsWord, ")"] })] })) : _jsx("span", { children: L.noRatingYet }) })] }), _jsxs("div", { className: "price", children: [_jsx("b", { children: t.price }), _jsxs("small", { children: ["\u062F / ", t.unit === "شهر" ? L.month : L.hour] })] })] }, t.id));
                                }) }))), _jsx("p", { className: "demo", children: L.demoNote })] })), tab === "register" && (_jsxs("div", { className: "page", children: [_jsx("h2", { className: "h2", children: L.registerTitle }), _jsx("p", { className: "lead", children: L.registerLead }), _jsx("p", { className: "lead", children: data.lang === "ar" ? `بعد إرسال طلبك، سنراجعه ونفعّله يدويًا.` : `Après l'envoi, votre profil est examiné puis activé manuellement.` }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fn", children: L.fullName }), _jsx("input", { id: "fn", className: "input", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "two", children: [_jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "ft", children: L.role }), _jsx("select", { id: "ft", className: "sel", value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value, gender: e.target.value === "center" ? "" : form.gender }), children: Object.keys(TYPES).map((k) => _jsx("option", { value: k, children: trType(k) }, k)) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fp", children: L.phone }), _jsx("input", { id: "fp", className: "input", inputMode: "numeric", placeholder: "20 123 456", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })] })] }), form.type !== "center" && (_jsxs("div", { className: "field", children: [_jsx("span", { className: "lb", children: L.genderReq }), _jsxs("div", { className: "wrapchips", children: [_jsx("button", { className: "chip", "aria-pressed": form.gender === "m", onClick: () => setForm({ ...form, gender: "m" }), children: L.genderM }), _jsx("button", { className: "chip", "aria-pressed": form.gender === "f", onClick: () => setForm({ ...form, gender: "f" }), children: L.genderF })] })] })), _jsxs("div", { className: "field", children: [_jsx("span", { className: "lb", children: L.subjects }), _jsx("div", { className: "wrapchips", children: SUBJECTS.map((s) => _jsx("button", { className: "chip", "aria-pressed": form.subjects.includes(s), onClick: () => toggle("subjects", s), children: trSubject(s) }, s)) })] }), _jsxs("div", { className: "field", children: [_jsx("span", { className: "lb", children: L.levels }), _jsx("div", { className: "wrapchips", children: LEVELS.map((l) => _jsx("button", { className: "chip", "aria-pressed": form.levels.includes(l), onClick: () => toggle("levels", l), children: trLevel(l) }, l)) })] }), _jsxs("div", { className: "field", children: [_jsx("span", { className: "lb", children: L.lessonMode }), _jsx("div", { className: "wrapchips", children: MODES.map((m) => _jsx("button", { className: "chip", "aria-pressed": form.modes.includes(m), onClick: () => toggle("modes", m), children: trMode(m) }, m)) })] }), _jsxs("div", { className: "two", children: [_jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fc", children: L.city }), _jsx("select", { id: "fc", className: "sel", value: form.city, onChange: (e) => { const c = CITIES.find((x) => x.name === e.target.value); setForm({ ...form, city: c.name, lat: c.lat, lng: c.lng }); }, children: CITIES.map((c) => _jsx("option", { value: c.name, children: trCity(c.name) }, c.name)) })] }), _jsxs("div", { className: "field", children: [_jsxs("label", { className: "lb", htmlFor: "fpr", children: [L.price, " (\u062F / ", form.type === "center" ? L.month : L.hour, ")"] }), _jsx("input", { id: "fpr", className: "input", inputMode: "numeric", value: form.price, onChange: (e) => setForm({ ...form, price: e.target.value.replace(/[^\d]/g, "") }) })] })] }), _jsxs("div", { className: "field", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [_jsx("span", { className: "lb", style: { margin: 0 }, children: L.mapPlace }), _jsxs("button", { className: "ghost", onClick: () => geolocate((p) => setForm((f) => ({ ...f, ...p }))), disabled: locating, children: [_jsx(LocateFixed, { size: 16 }), locating ? L.locating : L.myLoc] })] }), _jsx("div", { className: "bleed", children: _jsx(MapView, { center: formPos, onPick: (p) => setForm((f) => ({ ...f, ...p })), height: 240, zoom: 15 }) }), _jsxs("p", { className: "maphint", style: { padding: "8px 0 0" }, children: [form.lat == null ? L.mapPlaceHint1 : L.mapPlaceHint1b, form.type === "center" ? L.mapPlaceHintCenter : L.mapPlaceHintPerson] }), locNote && _jsx("div", { className: "note", style: { padding: "4px 0 0" }, role: "status", children: locNote })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fa", children: L.area }), _jsx("input", { id: "fa", className: "input", value: form.area, onChange: (e) => setForm({ ...form, area: e.target.value }) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fb", children: L.bio }), _jsx("textarea", { id: "fb", className: "input", rows: 3, placeholder: L.bioPh, value: form.bio, onChange: (e) => setForm({ ...form, bio: e.target.value }) })] }), _jsxs("div", { className: "field", children: [_jsx("span", { className: "lb", children: L.packTitle }), _jsxs("div", { className: "two", children: [_jsx("input", { className: "input", inputMode: "numeric", placeholder: L.packSessions, value: form.packSessions, onChange: (e) => setForm({ ...form, packSessions: e.target.value.replace(/[^\d]/g, "") }) }), _jsx("input", { className: "input", inputMode: "numeric", placeholder: L.packPrice, value: form.packPrice, onChange: (e) => setForm({ ...form, packPrice: e.target.value.replace(/[^\d]/g, "") }) })] })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "frf", children: L.refCodeField }), _jsx("input", { id: "frf", className: "input", placeholder: "QR-XXXXX", value: form.refBy, onChange: (e) => setForm({ ...form, refBy: e.target.value }) })] }), _jsx("div", { className: "decl", children: form.declared ? (_jsxs(_Fragment, { children: [_jsx(ShieldCheck, { size: 18, style: { flex: "none", color: "var(--wa)", marginTop: 2 } }), _jsxs("span", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8 }, children: [L.termsAgreedLabel, _jsx("button", { className: "linkbtn", onClick: () => setTermsOpen(true), children: L.termsEditLink })] })] })) : (_jsxs("span", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8, flexWrap: "wrap" }, children: [L.termsPrompt, _jsx("button", { className: "ghost", onClick: () => setTermsOpen(true), children: L.termsReadBtn })] })) }), errors.length > 0 && _jsx("ul", { className: "errs", role: "alert", children: errors.map((er) => _jsx("li", { children: er }, er)) }), _jsx("button", { className: "primary", onClick: publish, children: L.publish })] })), tab === "account" && (_jsxs("div", { className: "page", children: [_jsx("h2", { className: "h2", children: L.accountTitle }), _jsx("p", { className: "lead", children: L.accountLead }), _jsx("div", { className: "rolewrap", children: _jsxs("div", { className: "seg", style: { width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr" }, children: [_jsxs("button", { "aria-pressed": role === "parent", onClick: () => setRole("parent"), children: [_jsx(Users, { size: 16 }), L.imParent] }), _jsxs("button", { "aria-pressed": role === "teacher", onClick: () => setRole("teacher"), children: [_jsx(User, { size: 16 }), L.imTeacher] })] }) }), role === "parent" ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "h3", children: L.childrenTitle }), _jsxs("div", { className: "two", style: { marginBottom: 10 }, children: [_jsx("input", { className: "input", placeholder: L.childName, value: childName, onChange: (e) => setChildName(e.target.value) }), _jsx("select", { className: "sel", value: childLevel, onChange: (e) => setChildLevel(e.target.value), children: LEVELS.map((l) => _jsx("option", { value: l, children: trLevel(l) }, l)) })] }), _jsxs("button", { className: "ghost", style: { marginBottom: 14 }, onClick: addChild, children: [_jsx(Plus, { size: 16 }), L.addChild] }), data.children.length ? (_jsx("ul", { className: "mini", children: data.children.map((c) => (_jsxs("li", { children: [_jsxs("span", { children: [c.name, _jsx("small", { children: c.level })] }), _jsxs("span", { className: "rowbtns", children: [_jsx("button", { onClick: () => { setLevel(c.level); setTab("search"); }, children: L.useLevel }), _jsx("button", { className: "icon", onClick: () => removeChild(c.id), "aria-label": "\u062D\u0630\u0641", children: _jsx(Trash2, { size: 16 }) })] })] }, c.id))) })) : _jsx("p", { className: "lead", children: L.noChildren }), _jsx("p", { className: "h3", children: L.savedTitle }), data.savedSearches.length ? (_jsx("ul", { className: "mini", children: data.savedSearches.map((s) => {
                                            const now = matchCountFor(s);
                                            const delta = now - s.savedCount;
                                            return (_jsxs("li", { children: [_jsxs("span", { children: [s.label, delta > 0 && _jsxs("small", { children: ["+", delta, " ", L.newMatches] })] }), _jsxs("span", { className: "rowbtns", children: [_jsx("button", { onClick: () => applySaved(s), children: L.apply }), _jsx("button", { className: "icon", onClick: () => removeSaved(s.id), "aria-label": "\u062D\u0630\u0641", children: _jsx(Trash2, { size: 16 }) })] })] }, s.id));
                                        }) })) : _jsx("p", { className: "lead", children: L.noSaved }), _jsx("p", { className: "h3", children: L.inboxTitle }), messageThreads.length ? (_jsx("ul", { className: "mini", children: messageThreads.map(({ t, last }) => (_jsxs("li", { style: { cursor: "pointer" }, onClick: () => openTeacherChat(t), children: [_jsxs("span", { children: [t.name, _jsx("small", { children: last.text })] }), _jsx("span", { className: "meta", children: fmtDate(last.date) })] }, t.id))) })) : _jsx("p", { className: "lead", children: L.noMessages })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "card", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.teacherLookupTitle }), _jsx("p", { className: "lead", children: L.teacherLookupLead }), _jsxs("div", { className: "two", children: [_jsx("input", { className: "input", inputMode: "numeric", placeholder: "20 123 456", value: dashPhone, onChange: (e) => setDashPhone(e.target.value) }), _jsx("button", { className: "primary", style: { width: "auto", padding: "10px 16px" }, onClick: lookupTeacher, children: L.teacherLookupBtn })] }), dashErr && _jsx("p", { className: "note", style: { padding: 0, marginTop: 8 }, children: dashErr })] }), dashTeacher && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "card", children: [_jsxs("div", { className: "namerow", style: { marginBottom: 8 }, children: [_jsx(Avatar, { t: dashTeacher, size: 40 }), _jsxs("div", { children: [_jsx("strong", { children: dashTeacher.name }), _jsxs("div", { className: "meta", children: [trType(dashTeacher.type), sep, dashTeacher.area] })] })] }), _jsxs("div", { className: "badgerow", children: [isVerified(dashTeacherId) && _jsxs("span", { className: "badge v", children: [_jsx(ShieldCheck, { size: 11 }), L.verified] }), isPhoneVerified(dashTeacherId) && _jsxs("span", { className: "badge p", children: [_jsx(Check, { size: 11 }), L.phoneVerified] }), isFeaturedNow(dashTeacherId) && _jsx("span", { className: "hl", children: L.featured })] })] }), _jsxs("div", { className: "stats", children: [_jsxs("div", { children: [_jsx("b", { children: data.views[dashTeacherId] || 0 }), _jsx("span", { children: L.statViews })] }), _jsxs("div", { children: [_jsx("b", { children: data.contacts[dashTeacherId] || 0 }), _jsx("span", { children: L.statContacts })] }), _jsxs("div", { children: [_jsx("b", { children: ratings[dashTeacherId] ? (ratings[dashTeacherId].sum / ratings[dashTeacherId].n).toFixed(1) : "—" }), _jsx("span", { children: L.statRating })] })] }), _jsxs("div", { className: "card", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.phoneVerifyTitle }), isPhoneVerified(dashTeacherId) ? (_jsxs("span", { className: "badgebig", children: [_jsx(Check, { size: 16 }), L.phoneVerified] })) : otpStage === "idle" ? (_jsx("button", { className: "ghost", onClick: sendOtp, children: L.sendOtp })) : (_jsxs(_Fragment, { children: [_jsxs("p", { className: "lead", style: { margin: "0 0 8px" }, children: [L.otpDemo, " ", _jsx("strong", { children: otpCode })] }), _jsxs("div", { className: "two", children: [_jsx("input", { className: "input", inputMode: "numeric", placeholder: L.otpInput, value: otpInput, onChange: (e) => setOtpInput(e.target.value) }), _jsx("button", { className: "primary", style: { width: "auto", padding: "10px 16px" }, onClick: confirmOtp, children: L.confirm })] }), otpErr && _jsx("p", { className: "note", style: { padding: 0, marginTop: 8 }, children: otpErr })] }))] }), _jsxs("div", { className: "card", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.idVerifyTitle }), isVerified(dashTeacherId) ? (_jsxs("span", { className: "badgebig", children: [_jsx(ShieldCheck, { size: 16 }), L.isVerified] })) : data.verifications[dashTeacherId] === "pending" ? (_jsx("p", { className: "lead", style: { margin: 0 }, children: L.pendingVerify })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "lead", children: L.idVerifyLead }), _jsxs("button", { className: "ghost", onClick: requestVerify, children: [_jsx(ShieldCheck, { size: 16 }), L.requestVerify] })] }))] }), _jsxs("div", { className: "card", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.subTitle }), isSubscribed(dashTeacherId) ? (_jsxs("p", { className: "lead", style: { margin: 0 }, children: [data.subscriptions[dashTeacherId].paid === false ? L.trialUntil : L.paidUntil, " ", fmtDate(data.subscriptions[dashTeacherId].until), " \u00B7 ", data.subscriptions[dashTeacherId].plan === "featured" ? L.planFeatured : L.planBasic] })) : (_jsx("p", { className: "lead", children: L.subNone })), _jsxs("button", { className: "ghost", style: { marginTop: 8 }, onClick: () => setPaymentOpen(true), children: [_jsx(CreditCard, { size: 16 }), L.subscribeNow] })] }), _jsxs("div", { className: "card", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.refTitle }), _jsx("p", { className: "lead", children: L.refLead }), _jsx("p", { children: _jsx("span", { className: "refcode", children: refCode(dashTeacherId) }) }), _jsxs("div", { className: "two", style: { marginTop: 10 }, children: [_jsxs("button", { className: "ghost", onClick: shareReferral, children: [_jsx(Gift, { size: 16 }), L.refShare] }), _jsxs("div", { className: "meta", style: { alignSelf: "center" }, children: [L.refCount, ": ", (data.referrals[dashTeacherId] || { count: 0 }).count] })] })] })] }))] }))] })), tab === "owner" && (!ownerUnlocked ? (_jsxs("div", { className: "page", children: [_jsx("h2", { className: "h2", children: L.ownerTitle }), _jsxs("div", { className: "gate", children: [_jsx(Lock, { size: 28 }), data.ownerPass == null ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "h3", children: L.gateSetTitle }), _jsx("p", { className: "lead", children: L.gateSetLead }), _jsx("input", { className: "input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: ownerPassInput, onChange: (e) => setOwnerPassInput(e.target.value), style: { marginBottom: 8 } }), _jsx("input", { className: "input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: ownerPassInput2, onChange: (e) => setOwnerPassInput2(e.target.value), style: { marginBottom: 8 } }), ownerErr && _jsx("p", { className: "note", style: { padding: 0, marginBottom: 8 }, children: ownerErr }), _jsx("button", { className: "primary", onClick: setOwnerPassword, children: L.gateSetBtn })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "h3", children: L.gateEnterTitle }), _jsx("input", { className: "input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: ownerPassInput, onChange: (e) => setOwnerPassInput(e.target.value), style: { margin: "8px 0" } }), ownerErr && _jsx("p", { className: "note", style: { padding: 0, marginBottom: 8 }, children: ownerErr }), _jsx("button", { className: "primary", onClick: enterOwner, children: L.gateEnterBtn })] }))] })] })) : (_jsxs("div", { className: "page", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [_jsxs("div", { children: [_jsx("h2", { className: "h2", children: L.ownerTitle }), _jsx("p", { className: "lead", children: L.ownerLead })] }), _jsxs("button", { className: "iconbtn", onClick: () => { setOwnerUnlocked(false); setOwnerPassInput(""); }, children: [_jsx(LogOut, { size: 14 }), L.logout] })] }), _jsxs("div", { className: "stats", children: [_jsxs("div", { children: [_jsx("b", { children: all.length }), _jsx("span", { children: L.filesPublished })] }), _jsxs("div", { children: [_jsx("b", { children: totalContacts }), _jsx("span", { children: L.contactsTotal })] }), _jsxs("div", { children: [_jsx("b", { children: data.reviews.length }), _jsx("span", { children: L.reviewsTotal })] })] }), _jsxs("div", { className: "calc", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.settingsTitle }), _jsxs("div", { className: "two", children: [_jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "trd", children: L.trialDaysLabel }), _jsx("input", { id: "trd", className: "input", type: "number", min: "0", value: data.settings.trialDays, onChange: (e) => update((d) => ({ ...d, settings: { ...d.settings, trialDays: Math.max(0, Number(e.target.value)) } })) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "spp", children: L.subPriceLabel }), _jsx("input", { id: "spp", className: "input", type: "number", min: "0", value: data.settings.subPriceDT, onChange: (e) => update((d) => ({ ...d, settings: { ...d.settings, subPriceDT: Math.max(0, Number(e.target.value)) } })) })] })] })] }), _jsxs("div", { className: "calc", children: [_jsx("p", { className: "h3", style: { marginTop: 0 }, children: L.calcTitle }), _jsxs("p", { className: "meta", style: { marginBottom: 10 }, children: [L.realSubs, ": ", _jsx("strong", { children: realSubsCount })] }), _jsxs("div", { className: "two", children: [_jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "sp", children: L.monthlySub }), _jsx("input", { id: "sp", className: "input", type: "number", min: "0", value: subPrice, onChange: (e) => setSubPrice(Math.max(0, Number(e.target.value))) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "fpp", children: L.featPrice }), _jsx("input", { id: "fpp", className: "input", type: "number", min: "0", value: featPrice, onChange: (e) => setFeatPrice(Math.max(0, Number(e.target.value))) })] })] }), _jsxs("div", { className: "field", children: [_jsxs("label", { className: "lb", htmlFor: "tg", children: [L.subCount, ": ", target] }), _jsx("input", { id: "tg", className: "range", type: "range", min: "10", max: "1000", step: "10", value: target, onChange: (e) => setTarget(Number(e.target.value)) })] }), _jsxs("div", { className: "field", style: { marginBottom: 0 }, children: [_jsxs("label", { className: "lb", htmlFor: "fs", children: [L.featShare, ": ", featShare, "%"] }), _jsx("input", { id: "fs", className: "range", type: "range", min: "0", max: "50", step: "5", value: featShare, onChange: (e) => setFeatShare(Number(e.target.value)) })] }), _jsxs("div", { className: "result", children: [_jsxs("b", { children: [monthly.toLocaleString("fr-TN"), " \u062F"] }), " ", _jsx("span", { children: L.perMonth }), _jsxs("p", { children: [target, " \u00D7 ", subPrice, " + ", featuredCount, " \u00D7 ", featPrice, "."] })] })] }), _jsx("p", { className: "h3", children: L.reportsTitle }), data.reports.length ? (_jsx("ul", { className: "mini", children: data.reports.map((r) => (_jsxs("li", { children: [_jsxs("span", { children: [r.targetLabel, _jsxs("small", { children: [L[r.reason] || r.reason, r.note ? ` — ${r.note}` : ""] })] }), _jsxs("span", { className: "rowbtns", children: [r.kind === "review" && _jsx("button", { onClick: () => deleteReviewFromReport(r), children: L.deleteReview }), r.kind === "teacher" && data.registered.some((t) => t.id === r.targetId) && _jsx("button", { onClick: () => deleteFileFromReport(r), children: L.deleteFile }), _jsx("button", { onClick: () => dismissReport(r.id), children: L.dismiss })] })] }, r.id))) })) : _jsx("p", { className: "lead", children: L.noReports }), _jsx("p", { className: "h3", children: L.verifyQueueTitle }), pendingVerifications.length ? (_jsx("ul", { className: "mini", children: pendingVerifications.map((t) => (_jsxs("li", { children: [_jsx("span", { children: t.name }), _jsxs("span", { className: "rowbtns", children: [_jsx("button", { onClick: () => approveVerify(t.id), children: L.approve }), _jsx("button", { onClick: () => rejectVerify(t.id), children: L.reject })] })] }, t.id))) })) : _jsx("p", { className: "lead", children: L.noVerifyQueue }), _jsx("p", { className: "h3", children: L.latestReviews }), _jsx("p", { className: "lead", style: { marginBottom: 8 }, children: L.deleteMisuse }), _jsx("ul", { className: "mini", children: latestReviews.map((r) => (_jsxs("li", { children: [_jsxs("span", { children: [_jsx(Stars, { value: r.stars, size: 12 }), " ", nameOf(r.tid), _jsxs("small", { children: [r.name, ": ", r.text || "—"] })] }), _jsx("button", { className: "icon", "aria-label": "\u062D\u0630\u0641", onClick: () => update((d) => ({ ...d, reviews: d.reviews.filter((x) => x.id !== r.id) })), children: _jsx(Trash2, { size: 18 }) })] }, r.id))) }), _jsx("p", { className: "h3", children: L.topRequested }), topContacted.length ? (_jsx("ul", { className: "mini", children: topContacted.map((t) => _jsxs("li", { children: [_jsx("span", { children: t.name }), _jsx("span", { children: data.contacts[t.id] })] }, t.id)) })) : _jsx("p", { className: "lead", children: L.noContactsYet }), _jsx("p", { className: "h3", children: L.myFiles }), data.registered.length ? (_jsx("ul", { className: "mini", children: data.registered.map((t) => (_jsxs("li", { children: [_jsxs("span", { children: [t.name, "\u060C ", t.area, _jsx("small", { children: isSubscribed(t.id) ? `${data.subscriptions[t.id].paid === false ? L.trialUntil : L.paidUntil} ${fmtDate(data.subscriptions[t.id].until)}` : (data.subscriptions[t.id] ? `${L.subExpiredOn} ${fmtDate(data.subscriptions[t.id].until)}` : L.pendingApproval) })] }), _jsxs("span", { className: "rowbtns", style: { flexWrap: "wrap" }, children: [_jsx("button", { className: "ghost", style: { padding: "6px 10px" }, onClick: () => previewTeacher(t), children: L.viewProfile }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 13 }, children: [_jsx("input", { type: "checkbox", checked: getApprovePaid(t.id), onChange: (e) => setApprovePaid((a) => ({ ...a, [t.id]: e.target.checked })) }), L.paidCheckbox] }), _jsx("input", { className: "input", type: "date", style: { width: "auto", padding: "6px 8px" }, value: getApproveDate(t.id), onChange: (e) => setApproveDates((a) => ({ ...a, [t.id]: e.target.value })) }), _jsx("button", { onClick: () => { const wasSubscribed = isSubscribed(t.id); approveUntil(t.id); setToast(wasSubscribed ? L.markPaid : L.approveReg); }, children: isSubscribed(t.id) ? L.markPaid : L.approveReg }), _jsx("button", { className: "icon", "aria-label": "\u062D\u0630\u0641", onClick: () => { update((d) => ({ ...d, registered: d.registered.filter((x) => x.id !== t.id) })); setToast(L.fileDeleted); }, children: _jsx(Trash2, { size: 18 }) })] })] }, t.id))) })) : _jsx("p", { className: "lead", children: L.noMyFiles }), _jsx("button", { className: "danger", onClick: () => { update(() => ({ ...INITIAL, ownerPass: data.ownerPass, lang: data.lang })); setToast(L.resetDone); }, children: L.resetDemo })] })))] }), sel && (_jsx("div", { className: "overlay", onClick: () => setSelected(null), children: _jsxs("div", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-label": sel.name, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "close", "aria-label": "\u0625\u063A\u0644\u0627\u0642", onClick: () => setSelected(null), children: _jsx(X, { size: 18 }) }), _jsxs("h2", { children: [_jsx(Avatar, { t: sel, size: 34 }), sel.name, isFeaturedNow(sel.id) && _jsx("span", { className: "hl", children: L.featured })] }), _jsxs("div", { className: "badgerow", children: [isVerified(sel.id) && _jsxs("span", { className: "badge v", children: [_jsx(ShieldCheck, { size: 11 }), L.verified] }), isPhoneVerified(sel.id) && _jsxs("span", { className: "badge p", children: [_jsx(Check, { size: 11 }), L.phoneVerified] })] }), _jsxs("div", { className: "meta", children: [trType(sel.type), sep, sel.area, sep, fmtDist(sel.dist), " ", L.km] }), selRating && _jsxs("div", { className: "rate", children: [_jsx(Stars, { value: selRating.sum / selRating.n }), (selRating.sum / selRating.n).toFixed(1), _jsxs("span", { children: ["(", selRating.n, ")"] })] }), sel.bio && _jsx("p", { className: "bio", children: sel.bio }), _jsxs("dl", { className: "kv", children: [_jsx("dt", { children: L.subjects }), _jsx("dd", { children: sel.subjects.map(trSubject).join(sep) }), _jsx("dt", { children: L.levels }), _jsx("dd", { children: sel.levels.map(trLevel).join(sep) }), _jsx("dt", { children: L.lessonMode }), _jsx("dd", { children: sel.modes.map(trMode).join(sep) }), _jsx("dt", { children: L.price }), _jsxs("dd", { children: [sel.price, " \u062F / ", sel.unit === "شهر" ? L.month : L.hour] }), sel.pack && _jsxs(_Fragment, { children: [_jsx("dt", { children: L.packLabel }), _jsxs("dd", { children: [sel.pack.n, " \u00D7 ", sel.price, " \u2192 ", sel.pack.price, " \u062F"] })] }), _jsx("dt", { children: L.phone }), _jsx("dd", { dir: "ltr", style: { textAlign: "right" }, children: phoneRevealed ? fmtPhone(sel.phone) : "••• ••• ••" })] }), sel.type !== "center" && _jsx("p", { className: "approx", children: L.approxNote }), _jsxs("div", { className: `actions ${sel.type === "center" ? "three" : "two"}`, children: [!phoneRevealed ? (_jsxs(_Fragment, { children: [_jsxs("button", { className: "act chat", onClick: () => setChatOpen(true), children: [_jsx(MessageSquare, { size: 18 }), L.chatWith] }), _jsxs("button", { className: "act reveal", onClick: revealPhone, children: [_jsx(Phone, { size: 18 }), L.showPhone] })] })) : (_jsxs(_Fragment, { children: [_jsxs("a", { className: "act call", href: `tel:+216${sel.phone}`, children: [_jsx(Phone, { size: 18 }), L.call] }), _jsxs("a", { className: "act wa", href: `https://wa.me/216${sel.phone}`, target: "_blank", rel: "noreferrer", children: [_jsx(MessageCircle, { size: 18 }), L.whatsapp] })] })), sel.type === "center" && _jsxs("a", { className: "act dir", href: `https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lng}`, target: "_blank", rel: "noreferrer", children: [_jsx(Navigation, { size: 18 }), L.directions] })] }), chatOpen && (_jsxs("div", { className: "chatbox", children: [selMessages.map((m, i) => _jsx("div", { className: `bubble ${m.from === "me" ? "me" : "them"}`, children: m.text }, i)), _jsxs("div", { className: "composer", children: [_jsx("input", { className: "input", placeholder: L.chatPh, value: chatText, onChange: (e) => setChatText(e.target.value), onKeyDown: (e) => e.key === "Enter" && sendChat() }), _jsx("button", { onClick: sendChat, "aria-label": L.send, children: _jsx(Send, { size: 18 }) })] })] })), _jsxs("button", { className: "linkbtn", onClick: () => { setReportTarget({ kind: "teacher", id: sel.id, label: sel.name }); setReportOpen(true); }, children: [_jsx(Flag, { size: 13, style: { verticalAlign: "-2px", marginLeft: 4 } }), L.report] }), reportOpen && reportTarget && reportTarget.kind === "teacher" && (_jsxs("div", { className: "reportform", children: [_jsx("span", { className: "lb", children: L.reportReason }), _jsxs("select", { className: "sel", style: { marginBottom: 8 }, value: report.reason, onChange: (e) => setReport({ ...report, reason: e.target.value }), children: [_jsx("option", { value: "reasonInfo", children: L.reasonInfo }), _jsx("option", { value: "reasonBehavior", children: L.reasonBehavior }), _jsx("option", { value: "reasonScam", children: L.reasonScam }), _jsx("option", { value: "reasonOther", children: L.reasonOther })] }), _jsx("textarea", { className: "input", rows: 2, placeholder: L.reportOptNote, value: report.note, onChange: (e) => setReport({ ...report, note: e.target.value }), style: { marginBottom: 8 } }), _jsx("button", { className: "primary", onClick: submitReport, children: L.reportSubmit })] })), _jsx("div", { className: "revhead", children: selRating ? (_jsxs(_Fragment, { children: [_jsx("b", { children: (selRating.sum / selRating.n).toFixed(1) }), _jsxs("div", { children: [_jsx(Stars, { value: selRating.sum / selRating.n, size: 16 }), _jsxs("p", { className: "meta", children: [selRating.n, " ", selRating.n > 10 ? L.ratingsWordMany : L.ratingsWord] })] })] })) : _jsx("p", { className: "meta", children: L.noRatingYet }) }), selReviews.map((r) => (_jsxs("div", { className: "rev", children: [_jsxs("div", { className: "top", children: [_jsxs("strong", { children: [r.name, r.level ? `، ${r.level}` : ""] }), _jsxs("span", { children: [fmtDate(r.date), _jsx("button", { className: "flag", "aria-label": L.reportReview, onClick: () => { setReportTarget({ kind: "review", id: r.id, label: `${sel.name} — ${r.name}` }); setReportOpen(true); }, children: _jsx(Flag, { size: 12 }) })] })] }), _jsx(Stars, { value: r.stars, size: 13 }), r.text && _jsx("p", { children: r.text })] }, r.id))), reportOpen && reportTarget && reportTarget.kind === "review" && (_jsxs("div", { className: "reportform", children: [_jsx("span", { className: "lb", children: L.reportReason }), _jsxs("select", { className: "sel", style: { marginBottom: 8 }, value: report.reason, onChange: (e) => setReport({ ...report, reason: e.target.value }), children: [_jsx("option", { value: "reasonInfo", children: L.reasonInfo }), _jsx("option", { value: "reasonBehavior", children: L.reasonBehavior }), _jsx("option", { value: "reasonScam", children: L.reasonScam }), _jsx("option", { value: "reasonOther", children: L.reasonOther })] }), _jsx("textarea", { className: "input", rows: 2, placeholder: L.reportOptNote, value: report.note, onChange: (e) => setReport({ ...report, note: e.target.value }), style: { marginBottom: 8 } }), _jsx("button", { className: "primary", onClick: submitReport, children: L.reportSubmit })] })), alreadyReviewed ? (_jsx("p", { className: "hint", children: L.reviewHint1 })) : !contacted(sel.id) ? (_jsx("p", { className: "hint", children: L.reviewHint2 })) : !showReview ? (_jsx("button", { className: "primary", style: { marginTop: 14 }, onClick: () => setShowReview(true), children: L.rateBtn })) : (_jsxs("div", { className: "rform", children: [_jsx("span", { className: "lb", children: L.yourRating }), _jsx("div", { className: "starpick", role: "radiogroup", "aria-label": L.yourRating, children: [1, 2, 3, 4, 5].map((i) => _jsx("button", { role: "radio", "aria-checked": draft.stars === i, "aria-label": `${i}/5`, onClick: () => { setDraft({ ...draft, stars: i }); setDraftErr(""); }, children: _jsx(Star, { size: 30, fill: i <= draft.stars ? "currentColor" : "none" }) }, i)) }), _jsxs("div", { className: "two", children: [_jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "rn", children: L.yourName }), _jsx("input", { id: "rn", className: "input", value: draft.name, onChange: (e) => setDraft({ ...draft, name: e.target.value }) })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "rl", children: L.yourLevel }), _jsxs("select", { id: "rl", className: "sel", value: draft.level, onChange: (e) => setDraft({ ...draft, level: e.target.value }), children: [_jsx("option", { value: "", children: "\u2014" }), LEVELS.map((l) => _jsx("option", { value: l, children: trLevel(l) }, l))] })] })] }), _jsxs("div", { className: "field", children: [_jsx("label", { className: "lb", htmlFor: "rt", children: L.yourComment }), _jsx("textarea", { id: "rt", className: "input", rows: 3, placeholder: L.commentPh, value: draft.text, onChange: (e) => setDraft({ ...draft, text: e.target.value }) })] }), draftErr && _jsx("p", { className: "errs", role: "alert", style: { padding: 0 }, children: draftErr }), _jsx("button", { className: "primary", onClick: submitReview, children: L.postReview })] }))] }) })), termsOpen && (_jsx("div", { className: "overlay", onClick: () => setTermsOpen(false), children: _jsxs("div", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-label": L.termsTitle, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "close", "aria-label": "\u0625\u063A\u0644\u0627\u0642", onClick: () => setTermsOpen(false), children: _jsx(X, { size: 18 }) }), _jsx("h2", { style: { paddingLeft: 44 }, children: L.termsTitle }), _jsx("p", { className: "lead", children: L.termsIntro }), _jsx("ol", { className: "termsList", children: L.termsItems.map((it, i) => _jsxs("li", { children: [_jsx("strong", { children: it.t }), " \u2014 ", it.d] }, i)) }), _jsx("p", { className: "lead", style: { marginTop: 10 }, children: L.termsOutro }), _jsx("button", { className: "primary", onClick: () => { setForm((f) => ({ ...f, declared: true })); setTermsOpen(false); setToast(L.termsAgreedLabel); }, children: L.termsAgreeBtn })] }) })), paymentOpen && dashTeacher && (_jsx("div", { className: "overlay", onClick: () => setPaymentOpen(false), children: _jsxs("div", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-label": L.subscribeNow, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "close", "aria-label": "\u0625\u063A\u0644\u0627\u0642", onClick: () => setPaymentOpen(false), children: _jsx(X, { size: 18 }) }), _jsx("h2", { style: { paddingLeft: 44 }, children: L.subscribeNow }), _jsxs("div", { className: "planpick", children: [_jsxs("button", { className: "plancard", "aria-pressed": true, children: [_jsx("b", { children: `${data.settings.subPriceDT} \u062F` }), _jsx("span", { children: L.planBasic })] })] }), _jsxs("p", { className: "meta", children: [L.payVia, " Flouci \u2014 ", L.payViaNote] }), _jsx("button", { className: "primary", style: { marginTop: 10 }, onClick: goToPayment, children: L.payNow }), payError && _jsx("p", { className: "note", style: { padding: "8px 0 0" }, role: "alert", children: payError })] }) })), toast && _jsx("div", { className: "toast", role: "status", children: toast }), _jsx("nav", { className: "nav", children: _jsxs("div", { className: "nav-in", children: [_jsxs("button", { "aria-current": tab === "search" ? "page" : undefined, onClick: () => setTab("search"), children: [_jsx(Search, { size: 20 }), L.navSearch] }), _jsxs("button", { "aria-current": tab === "register" ? "page" : undefined, onClick: () => setTab("register"), children: [_jsx(UserPlus, { size: 20 }), L.navRegister] }), _jsxs("button", { "aria-current": tab === "account" ? "page" : undefined, onClick: () => setTab("account"), children: [_jsx(User, { size: 20 }), L.navAccount] }), _jsxs("button", { "aria-current": tab === "owner" ? "page" : undefined, onClick: () => setTab("owner"), children: [_jsx(BarChart3, { size: 20 }), L.navOwner] })] }) })] }));
}
