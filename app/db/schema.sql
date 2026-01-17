-- Skills 테이블
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER DEFAULT 2, -- 1: 초급, 2: 중급, 3: 고급, 4: 전문가
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 개인정보 테이블
CREATE TABLE IF NOT EXISTS personal_info (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 경력 테이블
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL, -- YYYY-MM 형식
  end_date TEXT, -- YYYY-MM 형식, NULL이면 현재 근무중
  is_current BOOLEAN DEFAULT 0,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  tech_stack TEXT NOT NULL, -- JSON 배열로 저장
  github_url TEXT,
  demo_url TEXT,
  category TEXT NOT NULL, -- 'personal', 'client', 'work' 등
  featured BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'completed', 'in_progress', 'archived'
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 개인정보 데이터
INSERT OR REPLACE INTO personal_info (key, value) VALUES
('name', '홍훈의'),
('title', 'Frontend Developer'),
('bio', '사용자 경험을 중시하는 Frontend Developer입니다. React와 TypeScript를 활용한 모던 웹 개발에 집중하고 있습니다.'),
('email', 'example@email.com'),
('location', 'Seoul, South Korea'),
('github', 'https://github.com/93minki'),
('velog', 'https://velog.io/@93minki');

-- 샘플 스킬 데이터
INSERT OR REPLACE INTO skills (name, category, proficiency) VALUES
('React', 'frontend', 3),
('TypeScript', 'frontend', 3),
('Next.js', 'frontend', 2),
('Tailwind CSS', 'frontend', 3),
('JavaScript', 'frontend', 3),
('Remix', 'frontend', 2),
('Node.js', 'backend', 2),
('PostgreSQL', 'database', 2),
('Vite', 'tools', 3),
('Git', 'tools', 3),
('Figma', 'tools', 2);

-- 샘플 경력 데이터
INSERT OR REPLACE INTO experiences (company_name, position, description, start_date, end_date, is_current, location, order_index) VALUES
('테크 스타트업', 'Frontend Developer', '- React와 TypeScript를 활용한 웹 애플리케이션 개발
- UI/UX 개선을 통한 사용자 경험 향상
- 컴포넌트 기반 재사용 가능한 UI 라이브러리 구축
- 성능 최적화를 통한 로딩 속도 30% 개선', '2022-03', NULL, 1, 'Seoul, Korea', 1),
('소프트웨어 회사', 'Junior Frontend Developer', '- 반응형 웹사이트 개발 및 유지보수
- REST API 연동 및 상태 관리 구현
- 크로스 브라우저 호환성 확보
- Git을 활용한 협업 및 코드 리뷰 참여', '2021-01', '2022-02', 0, 'Seoul, Korea', 2),
('웹 에이전시', '인턴 개발자', '- HTML, CSS, JavaScript를 활용한 웹 퍼블리싱
- 기존 웹사이트 리뉴얼 프로젝트 참여
- 모바일 최적화 작업 수행
- 개발 프로세스 학습 및 기초 역량 습득', '2020-07', '2020-12', 0, 'Seoul, Korea', 3);

-- 샘플 프로젝트 데이터
INSERT OR REPLACE INTO projects (
  title, description, long_description, tech_stack, 
  github_url, demo_url, category, featured, status, order_index
) VALUES
(
  'React Todo App',
  'TypeScript와 Tailwind CSS를 사용한 모던한 Todo 애플리케이션입니다. 직관적인 UI와 효율적인 상태 관리가 특징입니다.',
  'React Todo App은 현대적인 웹 개발 기술들을 활용하여 만든 할 일 관리 애플리케이션입니다. TypeScript로 타입 안정성을 확보하고, Tailwind CSS로 반응형 디자인을 구현했습니다. 로컬 스토리지를 활용한 데이터 영속성과 드래그 앤 드롭 기능을 제공합니다.',
  '["React", "TypeScript", "Tailwind CSS", "Vite"]',
  'https://github.com/93minki/react-todo',
  'https://react-todo-demo.vercel.app',
  'personal',
  1,
  'completed',
  1
);