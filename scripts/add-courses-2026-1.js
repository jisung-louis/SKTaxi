const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const DEPT_EMOJI = {
  '신학과': '⛪',
  '기독교교육상담학과': '📖',
  '문화선교학과': '🌍',
  '영어영문학과': '🇬🇧', '영어영문학과(2부)': '🇬🇧',
  '중어중문학과': '🇨🇳',
  '국어국문학과': '📝',
  '사회복지학과': '🤝', '사회복지학과(2부)': '🤝',
  '국제개발협력학과': '🌐',
  '행정학과': '🏛️', '행정학과(2부)': '🏛️', '행정학부': '🏛️',
  '관광학과': '✈️',
  '경영학과': '💼', '경영학과(2부)': '💼',
  '글로벌물류학과': '🚢', '글로벌물류학부': '🚢',
  '산업경영공학과': '⚙️',
  '유아교육과': '👶',
  '체육교육과': '⚽',
  '교직부': '🎓',
  '컴퓨터공학과': '💻',
  '정보통신공학과': '📡',
  '미디어소프트웨어학과': '📱',
  '도시디자인정보공학과': '🏙️',
  '음악학부': '🎵',
  '실용음악예술학과': '🎤', '실용음악과': '🎤',
  '연기예술학과': '🎭',
  '영화영상학과': '🎬',
  '뷰티디자인학과': '💄',
  '융합학부': '🔬',
  '파이데이아학부': '📚', '파이데이아학부(2부)': '📚',
};

function getEmoji(dept) {
  const baseDept = dept.replace(/\(.+\)$/, '');
  return DEPT_EMOJI[dept] || DEPT_EMOJI[baseDept] || '📗';
}

async function addAllCourses() {
  try {
    const jsonPath = path.join(__dirname, '..', 'docs', '2026-1-courses.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const courses = JSON.parse(rawData);

    console.log('📚 2026-1학기 수업 데이터 추가 시작...');
    console.log(`   총 ${courses.length}개 수업 로드 완료\n`);

    const byDept = {};
    for (const c of courses) {
      if (!byDept[c.department]) byDept[c.department] = [];
      byDept[c.department].push(c);
    }

    const deptNames = Object.keys(byDept).sort();
    let totalAdded = 0;

    // Firestore batch는 최대 500개 write 가능하므로 분할 처리
    const MAX_BATCH_SIZE = 400;
    let batch = db.batch();
    let batchCount = 0;

    for (const dept of deptNames) {
      const deptCourses = byDept[dept];
      const emoji = getEmoji(dept);
      console.log(`${emoji} ${dept} 수업 데이터 추가 중... (${deptCourses.length}개)`);

      for (const course of deptCourses) {
        const ref = db.collection('courses').doc();
        batch.set(ref, {
          grade: course.grade,
          category: course.category,
          code: course.code,
          division: course.division,
          name: course.name,
          credits: course.credits,
          professor: course.professor,
          schedule: course.schedule,
          location: course.location,
          note: '',
          semester: '2026-1',
          department: course.department,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        console.log(`  ${totalAdded + 1}. ${course.name} (${course.code}) - ${course.professor || '미정'} - ${course.category} - ${course.grade}학년`);
        totalAdded++;
        batchCount++;

        if (batchCount >= MAX_BATCH_SIZE) {
          await batch.commit();
          console.log(`  ⏫ ${batchCount}개 일괄 업로드 완료`);
          batch = db.batch();
          batchCount = 0;
        }
      }

      console.log(`✅ ${dept} 수업 ${deptCourses.length}개 추가 완료!\n`);
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`⏫ 나머지 ${batchCount}개 일괄 업로드 완료`);
    }

    console.log('\n🎉 모든 수업 데이터 추가 완료!');
    console.log('─'.repeat(50));
    for (const dept of deptNames) {
      const emoji = getEmoji(dept);
      console.log(`   ${emoji} ${dept}: ${byDept[dept].length}개`);
    }
    console.log('─'.repeat(50));
    console.log(`📊 총 ${deptNames.length}개 학과, ${totalAdded}개 수업 추가`);

  } catch (error) {
    console.error('❌ 수업 데이터 추가 실패:', error);
  } finally {
    process.exit(0);
  }
}

addAllCourses();
