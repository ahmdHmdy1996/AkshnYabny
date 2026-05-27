import { ContentItem } from '../types/game.types';

// ─── Egyptian Content ─────────────────────────────────────────────────────────

export const CONTENT_ITEMS: ContentItem[] = [
  // أفلام
  { id: 'm1', title: 'إسماعيلية رايح جاي', categoryId: 'movies' },
  { id: 'm2', title: 'اللمبي', categoryId: 'movies' },
  { id: 'm3', title: 'مرجان أحمد مرجان', categoryId: 'movies' },
  { id: 'm4', title: 'الإرهابي', categoryId: 'movies' },
  { id: 'm5', title: 'كابوريا', categoryId: 'movies' },
  { id: 'm6', title: 'عمر وسلمى', categoryId: 'movies' },
  { id: 'm7', title: 'المعلم', categoryId: 'movies' },
  { id: 'm8', title: 'خلي بالك من زوزو', categoryId: 'movies' },

  // مسلسلات
  { id: 't1', title: 'رأفت الهجان', categoryId: 'tvShows' },
  { id: 't2', title: 'لن أعيش في جلباب أبي', categoryId: 'tvShows' },
  { id: 't3', title: 'الحساسين', categoryId: 'tvShows' },
  { id: 't4', title: 'ليالي الحلمية', categoryId: 'tvShows' },
  { id: 't5', title: 'نيران صديقة', categoryId: 'tvShows' },
  { id: 't6', title: 'الاختيار', categoryId: 'tvShows' },
  { id: 't7', title: 'الداخلية في أزمة', categoryId: 'tvShows' },

  // مسرحيات
  { id: 'p1', title: 'مدرسة المشاغبين', categoryId: 'plays' },
  { id: 'p2', title: 'شاهد ما شافش حاجة', categoryId: 'plays' },
  { id: 'p3', title: 'العيال كبرت', categoryId: 'plays' },
  { id: 'p4', title: 'الواد سيد الشغال', categoryId: 'plays' },
  { id: 'p5', title: 'أنا وهو وهي', categoryId: 'plays' },
  { id: 'p6', title: 'بخيل موليير', categoryId: 'plays' },
  { id: 'p7', title: 'بمبة كشر', categoryId: 'plays' },
];

// ─── Crazy Rules ──────────────────────────────────────────────────────────────

export const CRAZY_RULES: string[] = [
  'مثل وإنت حاطط إيدك على راسك',
  'ممنوع تتحرك من مكانك خالص',
  'لازم تقلد صوت شخصية من الفيلم',
  'ممنوع تحرك أي إيد أثناء التمثيل',
  'الفريق التاني مقفول عنيه طول الجولة',
  'مثل وإنت واقف على رجل واحدة',
  'لازم تبقى بتضحك طول ما بتمثل',
  'مثل بأبطأ حركة ممكنة',
];
