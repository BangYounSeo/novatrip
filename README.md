# novatrip

## 프로젝트 소개

**NovaTrip**은 팀 프로젝트로 만든, 여행 정보 공유와 커뮤니티 기능을 결합한 서울 기반 여행 플랫폼입니다. (전체 기획·기능은 팀 단위로 진행되었습니다.)

- 사용자는 여행지를 탐색하고, 게시글을 작성하며, 좋아요·댓글·북마크 등을 통해 다른 사용자와 여행 경험을 공유할 수 있습니다.

**제가 담당한 역할**은 DB 설계와 커뮤니티 핵심 기능 구현이며, 프로젝트의 구조적 안정성을 맞추는 부분을 맡았습니다. 상세한 담당 내용은 아래 **담당 기능 상세**를 참고해 주세요.

## 기술 스택

- Frontend
  - React
  - JavaScript
  - TailwindCss

- Backend
  - Node.js
  - Express
  - JWT 기반 인증

- Database
  - MongoDB
  - Mongoose

- Tool/Infra
  - Git / GitHub
  - REST API

## 프로젝트 구성

### 프로젝트 유형: 팀 프로젝트
### 인원: 4명
### 개발 기간: 14일

---

## 프로젝트 전체 기능 개요

- **메인/지도**: 서울 지도 기반 여행지·이벤트 탐색, 추천 코스, 북마크·좋아요
- **커뮤니티**: 동행 구하기(mate) / 일반 포스트 게시판, 게시글 작성·수정·삭제, 다중 이미지 업로드
- **커뮤니티 상세**: 게시글 상세 조회(공지/동행/포스트 구분), 이미지 슬라이더, 여행 일정·장소·동행 조건 표시, 작성자 정보, 댓글·대댓글
- **댓글**: 댓글·대댓글 작성/수정/삭제, 그룹·깊이·순서 기반 정렬, 신고
- **신고·관리자**: 게시글/댓글 신고 처리, 관리자 전용 공지·회원·게시글·댓글 관리(숨김/삭제/제재)
- **여행 유형 분류**: 게시글/동행에 여행 스타일 태그(tourStyle) 적용(맛집탐방, 카페투어, 힐링/산책 등 18종, 최대 5개)
- **인증/회원**: 이메일·카카오 로그인, JWT, 회원 정보·마이페이지
- **기타**: 관광공사 Tour API 연동(이벤트/상세), 이벤트 광고 관리

---

## 담당 기능 상세

### 1. DB 설계 및 데이터 구조 정립

- MongoDB 기반 컬렉션 구조 설계
- **Board / Image / Good**: 게시글, 다중 이미지, 좋아요 도메인 스키마 설계
- **Review(댓글)**: 댓글·대댓글을 위한 `groupNum`, `depth`, `orderNo`, `parent` 필드로 계층 구조 설계
- 게시글·댓글의 **hidden**, **report** 필드로 신고·관리자 연동 전제

### 2. 커뮤니티 게시판 기능 구현

- 게시글 작성/수정/삭제 CRUD 구현
- 다중 이미지 업로드(multer, 최대 10장) 및 Image 컬렉션 연동
- 조회수(hitCount), 좋아요(Good 토글) API 구현

### 3. 커뮤니티 상세 페이지

- **Community.js** 기반 게시글 상세 화면 구현
- 공지/동행/포스트 타입별 분기(공지 시 여행 UI·댓글 영역 생략)
- 이미지 슬라이더(Slick), 제목·내용·조회수·작성일·작성자 정보 표시
- 동행 글일 때 여행 일정(startDate~endDate), 장소(tourSpot), 동행 조건(mateCondition) 표시
- CommunityHeader(수정/삭제/신고 등 액션) 연동

### 4. 댓글 기능 구현

- **reviewRouters**: 댓글 조회(GET), 작성(POST), 수정(PUT), 삭제(DELETE) API
- 대댓글 지원: `parent` 기준 groupNum/depth/orderNo 자동 계산
- 삭제 시 자식 댓글 존재 여부에 따라 ‘삭제된 댓글’ 표시 또는 연쇄 삭제 처리
- **ReviewList.js**: 댓글 목록·작성·수정·대댓글·신고 UI 연동

### 5. 신고 시스템 및 관리자 연동

- **게시글 신고**: `PUT /api/board/report/:numBrd` — Board.report 플래그 설정
- **댓글 신고**: `PUT /api/review/report/:id` — Review.report 플래그 설정
- **adminRouter**: 관리자 전용 라우터(공지 CRUD, 회원 목록/상세/제재, 게시글·댓글 목록/숨김·숨김해제·삭제)
- 게시글·댓글 목록/상세 조회 시 `hidden: false` 필터로 숨김 처리 반영

### 6. 여행 유형 분류(tourStyle)

- **boardSchema**에 `ALLOWED_TOUR_STYLES` 상수 정의(맛집탐방, 카페투어, 사진/인스타, 힐링/산책 등 18종)
- 게시글 `tourStyle` 배열 필드(중복 불가, 최대 5개), validator로 허용 값만 저장
- 글 작성/수정 시 tourStyle 정제(sanitize) 및 목록/상세 노출

### 7. UI 개선

- 커뮤니티 상세 레이아웃·반응형 처리(Container, Box, MUI Typography)
- 공지/동행/포스트에 따른 조건부 UI(일정·장소·동행 조건·댓글 영역)
- 이미지 슬라이더·버튼 스타일 정리

### 8. 코드 병합 및 충돌 관리

- 팀원 간 브랜치 병합 시 충돌 해결
- 라우터/모델/미들웨어 구조 정리로 중복 코드 제거

---

## .env.example

실제 .env 파일은 Git에 포함하지 않고 .env.example만 관리하여
보안 및 환경 분리를 유지했습니다.

- Server
  - PORT=8080
  - BASE_URL=http://localhost:8080
- MongoDB
  - MONGO_URI=http://localhost:27017
  - MONGO_DB_NAME=NovaTrip
- Auth
  - JWT_SECRET=YOUR_JWT_SECRET
- Email
  - EMAIL_USER=YOUR_EMAIL
  - EMAIL_PASS=YOUR_EMAIL_PASSWORD
- Kakao OAuth
  - KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
  - KAKAO_REDIRECT_URI=http://localhost:8080/login/auth/kakao/callback
- Frontend
  - FRONTEND_URL=http://localhost:3000
- Tour API
  - TOUR_API_SERVICE_KEY=YOUR_TOUR_API_KEY
  - TOUR_API_BASE=http://apis.data.go.kr/B551011/KorService2

## 실행 방법

### 환경

- Node.js 18+
- MongoDB

### 설치 및 실행

- npm install
- npm start

### 환경 변수 설정

- `.env.example` 파일을 참고하여 `.env` 파일 생성
- MongoDB, JWT, OAuth 관련 환경 변수 설정 필요

### 기본 접속

Frontend: http://localhost:3000  
Backend: http://localhost:8080

## 프로젝트를 통해 얻은 점

- MongoDB 기반 도메인 중심 DB 설계 경험
- 게시판 기능 구현을 통한 CRUD + 파일 처리 실전 경험
- 팀 프로젝트에서 코드 병합·충돌 해결 경험
- 기능 구현뿐 아니라 유지보수성과 구조를 고려한 개발 사고

## 참고

본 프로젝트는 학습 및 포트폴리오 목적의 팀 프로젝트이며,
실제 서비스 흐름을 고려한 구조로 구현되었습니다.
