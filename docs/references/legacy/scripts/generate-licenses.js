#!/usr/bin/env node

/**
 * Settings.bundle용 라이선스 정보 생성 스크립트
 * 
 * npm 패키지들의 라이선스 정보를 수집하여 Settings.bundle에 추가합니다.
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_BUNDLE_PATH = path.join(__dirname, '../ios/SKTaxi/Settings.bundle');
const LICENSE_PLIST_PATH = path.join(SETTINGS_BUNDLE_PATH, 'License.plist');

// 주요 라이선스 정보 (패키지명: {title, license, file})
const MAIN_LICENSES = {
  'react': {
    title: 'React',
    license: 'MIT',
    file: 'ReactLicense',
  },
  'react-native': {
    title: 'React Native',
    license: 'MIT',
    file: 'ReactNativeLicense',
  },
  '@react-navigation/native': {
    title: 'React Navigation',
    license: 'MIT',
    file: 'ReactNavigationLicense',
  },
  '@react-native-firebase/app': {
    title: 'React Native Firebase',
    license: 'Apache-2.0',
    file: 'ReactNativeFirebaseLicense',
  },
  'axios': {
    title: 'Axios',
    license: 'MIT',
    file: 'AxiosLicense',
  },
  'react-native-maps': {
    title: 'React Native Maps',
    license: 'MIT',
    file: 'ReactNativeMapsLicense',
  },
  'react-native-vector-icons': {
    title: 'React Native Vector Icons',
    license: 'MIT',
    file: 'ReactNativeVectorIconsLicense',
  },
  '@gorhom/bottom-sheet': {
    title: 'Bottom Sheet',
    license: 'MIT',
    file: 'BottomSheetLicense',
  },
  'react-native-reanimated': {
    title: 'React Native Reanimated',
    license: 'MIT',
    file: 'ReactNativeReanimatedLicense',
  },
};

// 라이선스 전문 텍스트
const LICENSE_TEXTS = {
  'MIT': `MIT License

Copyright (c) [YEAR] [COPYRIGHT HOLDERS]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,

  'Apache-2.0': `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright [YEAR] [COPYRIGHT HOLDERS]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
};

/**
 * 패키지 정보에서 라이선스 정보 가져오기
 */
function getPackageInfo(packageName) {
  try {
    const packagePath = path.join(__dirname, '../node_modules', packageName, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return {
        name: packageJson.name,
        version: packageJson.version,
        license: packageJson.license || 'Unknown',
        homepage: packageJson.homepage || '',
        repository: packageJson.repository?.url || packageJson.repository || '',
      };
    }
  } catch (error) {
    console.warn(`Warning: Could not read package info for ${packageName}:`, error.message);
  }
  return null;
}

/**
 * 라이선스 plist 파일 생성
 */
function createLicensePlist(fileName, title, licenseText) {
  const filePath = path.join(SETTINGS_BUNDLE_PATH, `${fileName}.plist`);
  
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>StringsTable</key>
	<string>${fileName}</string>
	<key>PreferenceSpecifiers</key>
	<array>
		<dict>
			<key>Type</key>
			<string>PSGroupSpecifier</string>
			<key>Title</key>
			<string>${escapeXml(title)}</string>
			<key>FooterText</key>
			<string>${escapeXml(licenseText)}</string>
		</dict>
	</array>
</dict>
</plist>`;

  fs.writeFileSync(filePath, plistContent, 'utf8');
  console.log(`✓ Created ${fileName}.plist`);
}

/**
 * XML 특수 문자 이스케이프
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * License.plist 업데이트
 */
function updateLicensePlist(licenses) {
  let preferenceSpecifiers = [
    {
      Type: 'PSChildPaneSpecifier',
      Title: 'SKURI Taxi',
      File: 'AppLicense',
    },
  ];

  // 주요 라이선스 추가
  licenses.forEach(license => {
    preferenceSpecifiers.push({
      Type: 'PSChildPaneSpecifier',
      Title: license.title,
      File: license.file,
    });
  });

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>StringsTable</key>
	<string>License</string>
	<key>PreferenceSpecifiers</key>
	<array>
${preferenceSpecifiers.map(spec => `		<dict>
			<key>Type</key>
			<string>${spec.Type}</string>
			<key>Title</key>
			<string>${escapeXml(spec.Title)}</string>
			<key>File</key>
			<string>${spec.File}</string>
		</dict>`).join('\n')}
	</array>
</dict>
</plist>`;

  fs.writeFileSync(LICENSE_PLIST_PATH, plistContent, 'utf8');
  console.log('✓ Updated License.plist');
}

/**
 * 메인 함수
 */
function main() {
  console.log('📦 Generating license files for Settings.bundle...\n');

  // Settings.bundle 디렉토리 확인
  if (!fs.existsSync(SETTINGS_BUNDLE_PATH)) {
    console.error(`Error: Settings.bundle directory not found at ${SETTINGS_BUNDLE_PATH}`);
    process.exit(1);
  }

  const licenses = [];

  // 각 주요 라이선스 처리
  for (const [packageName, licenseInfo] of Object.entries(MAIN_LICENSES)) {
    const packageInfo = getPackageInfo(packageName);
    
    if (packageInfo) {
      const licenseText = LICENSE_TEXTS[licenseInfo.license] || 
        `${licenseInfo.license} License\n\nFor more information, visit: ${packageInfo.homepage || 'N/A'}`;
      
      // 실제 패키지 정보를 포함한 라이선스 텍스트 생성
      const fullLicenseText = licenseText
        .replace('[YEAR]', new Date().getFullYear())
        .replace('[COPYRIGHT HOLDERS]', packageInfo.name || 'Original Authors')
        + (packageInfo.version ? `\n\nVersion: ${packageInfo.version}` : '')
        + (packageInfo.homepage ? `\n\nHomepage: ${packageInfo.homepage}` : '');
      
      createLicensePlist(licenseInfo.file, licenseInfo.title, fullLicenseText);
      licenses.push(licenseInfo);
    } else {
      console.warn(`⚠ Package not found: ${packageName}`);
    }
  }

  // License.plist 업데이트
  updateLicensePlist(licenses);

  console.log('\n✅ License files generated successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Review the generated license files in ${SETTINGS_BUNDLE_PATH}`);
  console.log(`2. Build and run your iOS app`);
  console.log(`3. Check Settings app > SKURI Taxi > 라이선스`);
}

main();

