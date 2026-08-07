# 04-tasks.md

MVP는 아래 3개 Phase로 진행한다. Phase 이름과 개수는 고정이며 변경하지 않는다.

- Phase 1 (설계): `CLAUDE.md` + `docs/` 6종 작성
- Phase 2 (백엔드): `backend/` FastAPI → CRUD API 5개 → Swagger 확인
- Phase 3 (프론트): `frontend/` HTML+JS+Tailwind → 메인 화면 → API 연결 → git push

## 진행 규칙

- 순서대로만 진행한다 (Phase 1 → 2 → 3), 병렬 진행 금지
- 각 단계는 '검증 방법'으로 확인 후에만 다음 단계로 넘어간다
- 확장 단계(JWT 로그인, 팀, Kanban, 채팅, CI/CD 등)는 본 문서에 포함하지 않는다
- 이후 지시 매핑: `backend 진행해` = Phase 2 전체, `frontend 진행해` = Phase 3 전체

---

## Phase 1 (설계) - 10단계 [지금 완료]

| 단계 | 작업 | 검증 방법 |
| --- | --- | --- |
| 1 | `CLAUDE.md` 작성 (역할/스택/절차/절대규칙 4개 섹션) | 파일 존재 및 4개 섹션 모두 포함 확인 |
| 2 | `docs/` 폴더 생성 | `docs/` 디렉토리 존재 확인 |
| 3 | `docs/00-overview.md` 작성 | 매핑표, 읽는 순서, 분리 근거 포함 여부 확인 |
| 4 | `docs/01-product.md` 작성 | 목표/페르소나/MVP 범위/성공 기준 포함 여부 확인 |
| 5 | `docs/02-specs.md` 작성 | Task 필드 7개, API 5개, 화면 명세 4개 표 포함 여부 확인 |
| 6 | `docs/03-design.md` 작성 | 8개 항목이 표 1개(4열)로 정리됐는지 확인 |
| 7 | `docs/04-tasks.md` 작성 (본 문서) | Phase 3개, 각 체크리스트 단계 수(10/10/8) 확인 |
| 8 | `docs/05-conventions.md` 작성 대기 | 파일 존재(빈 파일 또는 내용) 확인 |
| 9 | `CLAUDE.md`의 docs 파일명·순서와 실제 `docs/` 6개 파일 일치 확인 | 6개 파일명·순서 diff 없음 확인 |
| 10 | Phase 1 완료 선언 | 위 9단계 모두 체크 완료 |

---

## Phase 2 (백엔드) - 10단계

| 단계 | 작업 | 검증 방법 |
| --- | --- | --- |
| 1 | `backend/` 폴더 구조 확인/생성 | `backend/app`, `backend/tests` 존재 확인 |
| 2 | SQLAlchemy Task 모델 정의 (02-specs.md 필드 7개, 순서·타입 그대로) | 모델 코드와 02-specs.md 필드 표 1:1 대조 |
| 3 | SQLite 연결 및 세션 설정 | 앱 기동 시 DB 파일 생성 확인 |
| 4 | Pydantic 스키마 정의 (요청/응답, 목록은 description 제외) | 목록 응답에 description 없음, 단건 응답엔 있음 확인 |
| 5 | `POST /api/tasks` 구현 (status 생략 시 todo, 미정의 필드 422) | Swagger에서 201 응답 및 422 케이스 확인 |
| 6 | `GET /api/tasks` 구현 (목록) | Swagger에서 200, description 필드 미포함 확인 |
| 7 | `GET /api/tasks/{id}` 구현 (단건, 없는 id 404) | Swagger에서 200 및 존재하지 않는 id로 404 확인 |
| 8 | `PUT /api/tasks/{id}` 구현 (전 필드 수정, 형식 위반 400) | Swagger에서 200 및 잘못된 due_at으로 400 확인 |
| 9 | `DELETE /api/tasks/{id}` 구현 (204, 없는 id 404) | Swagger에서 204 및 존재하지 않는 id로 404 확인 |
| 10 | pytest로 CRUD 5개 API 테스트 작성 및 통과, Swagger UI(`/docs`)에서 5개 엔드포인트 최종 확인 | `pytest -q` 전체 통과 + `/docs` 접속하여 5개 API 노출 확인 |

---

## Phase 3 (프론트) - 8단계

| 단계 | 작업 | 검증 방법 |
| --- | --- | --- |
| 1 | `frontend/index.html` 골격 작성 (Tailwind CDN, macOS 톤 레이아웃) | 브라우저에서 페이지 렌더링 확인 |
| 2 | `frontend/app.js`에 상대경로 fetch(`/api/...`)로 API 연동 함수 작성 | 네트워크 탭에서 절대경로 아닌 `/api/...` 호출 확인 |
| 3 | 추가 폼(title/due_at/status) 구현 → `POST /api/tasks` | 폼 제출 후 목록에 카드 추가 확인 |
| 4 | 목록 카드 렌더링(status 배지 + `D-N HH:MM`) → `GET /api/tasks` | 목록 화면에서 배지와 마감 표시 확인 |
| 5 | 카드 클릭 → 수정 모달(전 필드) → `PUT /api/tasks/{id}` | 모달에서 값 변경 후 목록에 반영 확인 |
| 6 | 휴지통 클릭 → 확인 다이얼로그 → `DELETE /api/tasks/{id}` | 확인 후 카드가 목록에서 사라짐 확인 |
| 7 | 라이트/다크 테마 토글(localStorage 저장) + 360px 반응형 점검 | 새로고침 후 테마 유지, 360px 뷰포트에서 레이아웃 확인 |
| 8 | 전체 동작 재확인 후 git push | `git status` 클린 확인 후 push 완료 확인 |
