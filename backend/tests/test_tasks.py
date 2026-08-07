import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def create_sample_task(**overrides):
    payload = {"title": "샘플 작업", "status": "todo", "due_at": "2026-12-31T18:00:00"}
    payload.update(overrides)
    return client.post("/api/tasks", json=payload)


def test_create_task_success():
    response = create_sample_task()
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "샘플 작업"
    assert body["status"] == "todo"
    assert body["due_at"] == "2026-12-31T18:00:00Z"
    assert "description" in body


def test_create_task_default_status_is_todo():
    response = client.post("/api/tasks", json={"title": "상태 생략"})
    assert response.status_code == 201
    assert response.json()["status"] == "todo"


def test_create_task_missing_title_returns_400():
    response = client.post("/api/tasks", json={"status": "todo"})
    assert response.status_code == 400


def test_create_task_invalid_status_returns_400():
    response = client.post("/api/tasks", json={"title": "잘못된 상태", "status": "unknown"})
    assert response.status_code == 400


def test_create_task_invalid_due_at_returns_400():
    response = client.post(
        "/api/tasks", json={"title": "잘못된 마감", "due_at": "not-a-date"}
    )
    assert response.status_code == 400


def test_create_task_extra_field_returns_422():
    response = client.post(
        "/api/tasks", json={"title": "여분 필드", "unexpected_field": "x"}
    )
    assert response.status_code == 422


def test_list_tasks_excludes_description():
    create_sample_task(description="상세 설명")
    response = client.get("/api/tasks")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert "description" not in body[0]


def test_get_task_includes_description():
    created = create_sample_task(description="상세 설명").json()
    response = client.get(f"/api/tasks/{created['id']}")
    assert response.status_code == 200
    assert response.json()["description"] == "상세 설명"


def test_get_task_not_found_returns_404():
    response = client.get("/api/tasks/999")
    assert response.status_code == 404


def test_update_task_success():
    created = create_sample_task().json()
    response = client.put(
        f"/api/tasks/{created['id']}",
        json={
            "title": "수정된 제목",
            "description": "수정된 설명",
            "status": "in_progress",
            "due_at": "2026-01-01T09:00:00",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "수정된 제목"
    assert body["status"] == "in_progress"
    assert body["description"] == "수정된 설명"


def test_update_task_not_found_returns_404():
    response = client.put(
        "/api/tasks/999",
        json={"title": "없음", "status": "todo", "due_at": None},
    )
    assert response.status_code == 404


def test_delete_task_success():
    created = create_sample_task().json()
    response = client.delete(f"/api/tasks/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/api/tasks/{created['id']}").status_code == 404


def test_delete_task_not_found_returns_404():
    response = client.delete("/api/tasks/999")
    assert response.status_code == 404
