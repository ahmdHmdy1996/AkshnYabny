const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// روابط ويكيبيديا للقوائم (كمثال مبدئي)
const WIKI_URLS = {
  movies: 'https://ar.wikipedia.org/wiki/قائمة_الأفلام_المصرية',
  tvShows: 'https://ar.wikipedia.org/wiki/قائمة_المسلسلات_التلفزيونية_المصرية'
};

async function scrapeWikipedia() {
  console.log('⏳ جاري سحب البيانات من ويكيبيديا...');
  let contentItems = [];
  let movieIdCounter = 1;
  let tvIdCounter = 1;

  try {
    // 1. سحب الأفلام
    console.log('🎬 جاري سحب الأفلام...');
    const { data: moviesHtml } = await axios.get(WIKI_URLS.movies);
    const $movies = cheerio.load(moviesHtml);
    
    // ويكيبيديا بتستخدم جداول وقوائم، السيلكتور ده بيجيب أغلب الروابط اللي جوه الجداول
    $movies('.mw-parser-output table tr td i a, .mw-parser-output table tr td a').each((_, el) => {
      let title = $movies(el).text().trim();
      // تنظيف الاسم من الأقواس وسنة الإصدار
      title = title.replace(/\s*\(.*?\)\s*/g, '').trim();
      
      if (title && title.length > 2 && !contentItems.find(i => i.title === title)) {
        contentItems.push({
          id: `m${movieIdCounter++}`,
          title: title,
          categoryId: 'movies'
        });
      }
    });

    // 2. سحب المسلسلات
    console.log('📺 جاري سحب المسلسلات...');
    const { data: tvHtml } = await axios.get(WIKI_URLS.tvShows);
    const $tv = cheerio.load(tvHtml);
    
    $tv('.mw-parser-output ul li i a, .mw-parser-output ul li a').each((_, el) => {
      let title = $tv(el).text().trim();
      title = title.replace(/\s*\(.*?\)\s*/g, '').trim();
      
      if (title && title.length > 2 && !contentItems.find(i => i.title === title)) {
        contentItems.push({
          id: `t${tvIdCounter++}`,
          title: title,
          categoryId: 'tvShows'
        });
      }
    });

    // إضافة مسرحيات يدوية أو سحبها لو متوفرة صفحة مجمعة
    // ...

    console.log(`✅ تم تجميع ${contentItems.length} عمل فني بنجاح!`);

    // 3. كتابة الملف بصيغة TypeScript
    const fileContent = `export type CategoryId = 'movies' | 'tvShows' | 'plays';\n\nexport interface ContentItem {\n  id: string;\n  title: string;\n  categoryId: CategoryId;\n}\n\nexport const CONTENT_ITEMS: ContentItem[] = ${JSON.stringify(contentItems, null, 2)};\n`;

    fs.writeFileSync('movies_database.ts', fileContent, 'utf-8');
    console.log('🎉 تم إنشاء ملف movies_database.ts بنجاح!');

  } catch (error) {
    console.error('❌ حصل خطأ أثناء السحب:', error.message);
  }
}

scrapeWikipedia();