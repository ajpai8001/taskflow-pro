# 05-conventions.md

## 명명 규칙

- 백엔드: `snake_case`
- 프론트: `camelCase`
- 컴포넌트: `PascalCase`
- 식별자는 영어로 작성, 주석만 한국어로 작성

## 금지 5개

| 금지 | 이유 | 대안 |
| --- | --- | --- |
| `print` 디버깅 | 노이즈 발생 | `logging` 모듈 사용 |
| bare `except` | 예외 삼킴 | `except SpecificError`처럼 구체적 예외 지정 |
| 비밀번호 하드코딩 | 보안 사고 위험 | `.env` + `os.getenv` 사용 |
| `any` 타입 (TS) | 타입의 의미 상실 | 명시적 타입 지정 |
| `!important` | CSS 우선순위 꼬임 | 셀렉터 구조 개선 |

## 구현 시 반드시 지킬 것

| 항목 | 내용 |
| --- | --- |
| SQLite id 재사용 금지 | 삭제된 row의 id를 다른 row에 재사용하지 않는다 |
| 수정 모달 데이터 로드 | 단건 조회(`GET /api/tasks/{id}`)로 전 필드를 채운 뒤 전송한다 |
| 스펙 외 필드 거부 | 스펙에 없는 필드는 `422`로 거부한다. Pydantic 모델의 `model_config`에 `extra="forbid"`를 설정한다. 조용히 무시하지 않는다 |
| 다크모드 설정 로드 순서 | 다크모드 설정 로직은 Tailwind CDN 스크립트가 로드된 뒤에 둔다 |

## 테스트

- pytest 사용
- 정상 케이스와 함께 `404` / `400` 케이스를 반드시 포함한다

## git 커밋 규칙

- 커밋 접두사: `feat` / `fix` / `docs` / `refactor` / `test` / `chore`
- 접두사 뒤에 한국어로 요약 작성
