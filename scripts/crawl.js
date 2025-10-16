const axios = require('axios');
const cheerio = require('cheerio');

async function crawlNoticeContent(url) {
  try {
    const { data } = await axios.get(url, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    const $ = cheerio.load(data);

    // 본문 HTML
    const contentHtml = $('.view-con').html() || '';

    // 첨부파일 정보 추출
    const attachments = [];
    $('.view-file li').each((_, el) => {
      const downloadAnchor = $(el).find('a').first();
      const previewAnchor = $(el).find('a').eq(1);
      if (downloadAnchor.length > 0) {
        attachments.push({
          name: downloadAnchor.text().trim(),
          downloadUrl: `https://www.sungkyul.ac.kr${downloadAnchor.attr('href')}`,
          previewUrl: previewAnchor.length > 0
            ? `https://www.sungkyul.ac.kr${previewAnchor.attr('href')}`
            : null
        });
      }
    });

    return {
      contentHtml,
      attachments
    };
  } catch (error) {
    console.error('❌ 본문 크롤링 실패:', url, error.message);
    return {
      contentHtml: '',
      attachments: []
    };
  }
}

module.exports = { crawlNoticeContent };