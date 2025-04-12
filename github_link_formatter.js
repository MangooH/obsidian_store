// 모든 마크다운 파일에서 Obsidian 위키링크를 GitHub 마크다운 링크로 변환
const fs = require('fs');
const path = require('path');

// 저장소 루트 디렉토리
const rootDir = __dirname;
const contentDir = path.join(rootDir, 'obsidian_store');

// 메인 README.md
const readmePath = path.join(rootDir, 'README.md');

// 모든 .md 파일 찾기 (재귀 함수)
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      // 숨김 폴더가 아니면 재귀적으로 탐색
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      // .md 파일 추가
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 파일 경로를 GitHub URL로 변환
function getRelativePath(filePath) {
  return filePath.replace(rootDir + '/', '').replace(/\s/g, '%20');
}

// 메인 함수
async function processFiles() {
  // 모든 마크다운 파일 찾기
  const mdFiles = findMarkdownFiles(contentDir);
  
  // 파일들의 제목과 경로를 맵핑
  const fileMap = {};
  
  // 각 파일 처리
  for (const filePath of mdFiles) {
    const relativePath = getRelativePath(filePath);
    const fileName = path.basename(filePath, '.md');
    
    fileMap[fileName] = relativePath;
  }
  
  // README.md 파일 생성
  let readme = `# Obsidian Store

이 저장소는 Obsidian 노트를 공개하는 GitHub 저장소입니다.

## 주요 파일

- [🌐 000 MKH Home](${fileMap['🌐 000 MKH Home'] || 'obsidian_store/🌐%20000%20MKH%20Home.md'})

## MOC (Maps of Content)

`;

  // 1st Level MOC 찾기
  const mocFiles = mdFiles.filter(file => file.includes('MOC') && !file.includes('README'));
  const firstLevelMoc = mocFiles.filter(file => file.includes('1st Level MOC'));
  
  for (const mocFile of firstLevelMoc) {
    const fileName = path.basename(mocFile, '.md');
    const relativePath = getRelativePath(mocFile);
    
    readme += `- [${fileName}](${relativePath})\n`;
  }
  
  // README 저장
  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`README.md 파일이 생성되었습니다.`);
  
  console.log('모든 처리가 완료되었습니다!');
}

// 스크립트 실행
processFiles().catch(err => {
  console.error('오류 발생:', err);
});
