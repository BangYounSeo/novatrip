![header](https://capsule-render.vercel.app/api?type=transparent&height=100&section=header&text=NovaTrip&fontSize=48&fontColor=4B6BFB)

## [프로젝트 소개]

**NovaTrip**은 팀 프로젝트로 만든, 여행 정보 공유와 커뮤니티 기능을 결합한 서울 기반 여행 플랫폼입니다.  
사용자는 여행지를 탐색하고, 게시글을 작성하며, 좋아요·댓글·북마크 등을 통해 다른 사용자와 여행 경험을 공유할 수 있습니다.

저는 게시판·댓글·신고 시스템 등 사용자 상호작용 기능을 중심으로 개발을 진행했으며, 전반적인 UI/UX 개선을 담당했습니다.

<br/>

## [기술 스택]

<table width="100%">
<tr>
<td width="50%" valign="top">

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

</td>

<td width="50%" valign="top">

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge)

</td>
</tr>

<tr>
<td valign="top">

### Database

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge)

</td>

<td valign="top">

### Tool / Infra

![Git / Github](https://img.shields.io/badge/Git_/_Github-F05032?style=for-the-badge&logo=git&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-000000?style=for-the-badge)

</td>
</tr>
</table>

<br/>

## [프로젝트 구성]

#### 프로젝트 유형 : 팀 프로젝트 / **개발 인원** : 4명 / **개발 기간** : 14일

<br/>

## [프로젝트 전체 기능 개요]

- **메인/지도**: 서울 지도 기반 여행지·이벤트 탐색, 추천 코스, 북마크·좋아요
- **커뮤니티**: 동행 구하기(mate) / 일반 포스트 게시판, 게시글 작성·수정·삭제, 다중 이미지 업로드
- **커뮤니티 상세**: 게시글 상세 조회(공지/동행/포스트 구분), 이미지 슬라이더, 여행 일정·장소·동행 조건 표시, 작성자 정보, 댓글·대댓글
- **댓글**: 댓글·대댓글 작성/수정/삭제, 그룹·깊이·순서 기반 정렬, 신고
- **신고·관리자**: 게시글/댓글 신고 처리, 관리자 전용 공지·회원·게시글·댓글 관리(숨김/삭제/제재)
- **여행 유형 분류**: 게시글/동행에 여행 스타일 태그(tourStyle) 적용(18종, 최대 5개)
- **인증/회원**: 이메일·카카오 로그인, JWT, 회원 정보·마이페이지
- **기타**: 관광공사 Tour API 연동(이벤트/상세), 이벤트 광고 관리

<br/>

## [담당 기능 상세]

#### (1) 커뮤니티 게시판 기능 구현
- 게시글 작성/수정/삭제 CRUD 구현
- 다중 이미지 업로드(multer, 최대 10장) 및 Image 컬렉션 연동
- 조회수(hitCount), 좋아요(Good 토글) API 구현

#### (2) 커뮤니티 상세 페이지
- **Community.js** 기반 게시글 상세 화면 구현
- 공지/동행/포스트 타입별 분기 처리
- 이미지 슬라이더(Slick), 제목·내용·조회수·작성일·작성자 정보 표시
- 동행 글일 경우 여행 일정(startDate~endDate), 장소(tourSpot), 동행 조건(mateCondition) 표시
- CommunityHeader(수정/삭제/신고 등 액션) 연동

#### (3) 댓글 기능 구현
- **reviewRouters**: 댓글 조회(GET), 작성(POST), 수정(PUT), 삭제(DELETE) API
- 대댓글 지원 구조 구현
- 삭제 시 자식 댓글 존재 여부에 따른 처리
- **ReviewList.js**: 댓글 목록·작성·수정·대댓글·신고 UI 연동

#### (4) 신고 시스템 및 관리자 연동
- 게시글 신고 API 구현
- 댓글 신고 API 구현
- 관리자 라우터 연동을 통한 숨김/삭제 처리 반영

#### (5) 여행 유형 분류(tourStyle)
- 게시글에 여행 스타일 태그 적용
- 배열 기반 저장 및 유효성 검사 처리
- 작성/수정 시 정제 후 목록·상세 화면 노출

#### (6) UI 개선
- 커뮤니티 상세 레이아웃·반응형 처리
- 공지/동행/포스트에 따른 조건부 UI 구성
- 이미지 슬라이더·버튼 스타일 정리

<br/>

## [DB 설정 구조(보안 분리)]

실제 .env 파일은 Git에 포함하지 않고 `.env.example`만 관리하여 보안 및 환경 분리를 유지했습니다.

#### (1) Server
- PORT=8080
- BASE_URL=http://localhost:8080

#### (2) MongoDB
- MONGO_URI=http://localhost:27017
- MONGO_DB_NAME=NovaTrip

#### (3) Auth
- JWT_SECRET=YOUR_JWT_SECRET

#### (4) Email
- EMAIL_USER=YOUR_EMAIL
- EMAIL_PASS=YOUR_EMAIL_PASSWORD

#### (5) Kakao OAuth
- KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
- KAKAO_REDIRECT_URI=http://localhost:8080/login/auth/kakao/callback

#### (6) Frontend
- FRONTEND_URL=http://localhost:3000

#### (7) Tour API
- TOUR_API_SERVICE_KEY=YOUR_TOUR_API_KEY
- TOUR_API_BASE=http://apis.data.go.kr/B551011/KorService2

<br/>

## [실행 방법]

#### (1) 환경
- Node.js 18+
- MongoDB

#### (2) 설치 및 실행
- npm install
- npm start

#### (3) 환경 변수 설정
- `.env.example` 파일을 참고하여 `.env` 파일 생성
- MongoDB, JWT, OAuth 관련 환경 변수 설정 필요

#### (4) 기본 접속
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

<br/>

## [참고]

본 프로젝트는 학습 및 포트폴리오 목적의 팀 프로젝트이며, 실제 서비스 흐름을 고려한 구조로 구현되었습니다.

<br/>

**프로젝트 발표 자료(PPT)** : https://drive.google.com/file/d/1RKzOisGW_UBZ8vXKx9tO3jQSuSbT2Fc_/view?usp=drive_link
