# 02-specs.md

## Task 모델 필드 (7개, 순서 고정)

| 순서 | 필드명 | 타입 | 설명 |
| --- | --- | --- | --- |
| 1 | `id` | INTEGER, PK, AUTOINCREMENT | 자동 증가 기본키 |
| 2 | `title` | VARCHAR(200) | 필수 |
| 3 | `description` | TEXT | 선택 |
| 4 | `status` | `todo` / `in_progress` / `done` | 기본값 `todo` |
| 5 | `due_at` | DATETIME (UTC) | 선택 |
| 6 | `created_at` | DATETIME | 서버 자동 생성 |
| 7 | `updated_at` | DATETIME | 서버 자동 갱신 |

## 검증 규칙

- `title` / `status` / `due_at` 형식 위반 시 `400` 반환
- `due_at`은 ISO 8601 형식만 허용
- 존재하지 않는 `id` 조회/수정/삭제 시 `404` 반환
- `POST /api/tasks`에서도 `status` 지정 가능 (생략 시 `todo`)
- 스펙에 없는 필드가 요청에 포함되면 `422`로 거부한다 - 조용히 무시하지 않는다

## REST API (5개, `/api/` 접두사 필수)

| 메서드 | 경로 | 응답 코드 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/tasks` | 201 | 생성 |
| GET | `/api/tasks` | 200 | 목록 조회 |
| GET | `/api/tasks/{id}` | 200 | 단건 조회 |
| PUT | `/api/tasks/{id}` | 200 | 수정 (모달에서 전 필드 전송) |
| DELETE | `/api/tasks/{id}` | 204 | 삭제 |

- 목록 응답: `description` 필드 제외
- 단건 응답: `description` 필드 포함

## 화면 명세

### 1. 추가 - 폼

| 항목 | 내용 |
| --- | --- |
| 입력 필드 | `title`, `due_at`, `status` |
| 동작 | 폼 제출 시 `POST /api/tasks` 호출 |
| 결과 | 성공 시 목록에 새 카드 추가 |

### 2. 목록 - 카드

| 항목 | 내용 |
| --- | --- |
| 표시 요소 | status 배지, `D-N HH:MM` 형식의 마감 표시 |
| 데이터 소스 | `GET /api/tasks` |
| 제외 필드 | `description` |

### 3. 수정 - 카드 클릭 > 모달

| 항목 | 내용 |
| --- | --- |
| 트리거 | 카드 클릭 시 모달 오픈 |
| 데이터 로드 | `GET /api/tasks/{id}` (전 필드 포함) |
| 수정 가능 필드 | 전 필드 수정 가능 |
| 저장 동작 | `PUT /api/tasks/{id}` 호출 |

### 4. 삭제 - 휴지통 > 확인 > DELETE

| 항목 | 내용 |
| --- | --- |
| 트리거 | 카드의 휴지통 아이콘 클릭 |
| 확인 절차 | 삭제 확인 다이얼로그 표시 |
| 확정 동작 | `DELETE /api/tasks/{id}` 호출 |
| 결과 | 성공 시 목록에서 카드 제거 |
