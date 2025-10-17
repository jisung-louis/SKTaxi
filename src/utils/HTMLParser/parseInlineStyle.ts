/*
* 아직 이 파일은 사용하지 않음
* 일단 react-native-render-html 의 기본 기능을 사용하고 있음 (img, table 제외)
* 나줃에 inline CSS 적용, 본문과 거의 비슷한 스타일의 공지를 그리기 위해 <p>, <span>, <a>, <table> 등을 RN에서 렌더링 할 수 있도록 함
* fontSize, fontWeight, color, textAlign, lineHeight, letterSpacing, textAlign 등을 적용할 수 있도록 함
* 성결대 공지사항 상세 페이지의 html 구조를 전부 파악하고, 필요한 부분만 렌더링 할 수 있도록 함
*/


export function parseInlineStyle(styleString: string): Record<string, any> {
  const style: Record<string, any> = {};
  const rules = styleString.split(';').map(rule => rule.trim()).filter(Boolean);

  for (const rule of rules) {
    const [property, value] = rule.split(':').map(part => part.trim());

    if (!property || !value) continue;

    switch (property) {
      case 'text-align':
        style.textAlign = value;
        break;
      case 'font-size':
        style.fontSize = parseFloat(value);
        break;
      case 'font-weight':
        style.fontWeight = value;
        break;
      case 'color':
    //   case 'background-color':
    //     style[camelCase(property)] = rgbToHex(value);
    //     break;
      case 'line-height':
        style.lineHeight = parseFloat(value);
        break;
      case 'letter-spacing':
        style.letterSpacing = parseFloat(value);
        break;
      case 'text-decoration':
      case 'text-decoration-line':
        style.textDecorationLine = value;
        break;
      case 'font-family':
        style.fontFamily = normalizeFontFamily(value);
        break;
      default:
        // Optional: log or ignore unsupported styles
        break;
    }
  }

  return style;
}

function camelCase(prop: string) {
  return prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function rgbToHex(rgb: string): string {
  const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) return rgb;
  const [_, r, g, b] = rgbMatch;
  return `#${[r, g, b].map(x => Number(x).toString(16).padStart(2, '0')).join('')}`;
}

function normalizeFontFamily(value: string): string {
  const clean = value.replace(/['"]/g, '').split(',')[0].trim();
  // Example mapping
  switch (clean) {
    case '굴림':
    case '맑은 고딕':
      return 'AppleSDGothicNeo'; // Customize for platform
    case '한컴바탕':
      return 'Times New Roman'; // Fallback
    default:
      return clean;
  }
}