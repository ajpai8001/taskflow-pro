import logging
from pathlib import Path

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import Base, engine, get_db

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow Pro API")

api_router = APIRouter(prefix="/api")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    # 스펙 외 필드는 422, 그 외 형식 위반은 400 (02-specs.md)
    has_extra_field_error = any(error["type"] == "extra_forbidden" for error in errors)
    status_code = (
        status.HTTP_422_UNPROCESSABLE_ENTITY
        if has_extra_field_error
        else status.HTTP_400_BAD_REQUEST
    )
    return JSONResponse(
        status_code=status_code, content={"detail": jsonable_encoder(errors)}
    )


@api_router.get("/health")
def health_check():
    return {"status": "ok"}


@api_router.post(
    "/tasks", response_model=schemas.TaskDetail, status_code=status.HTTP_201_CREATED
)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task_in)


@api_router.get("/tasks", response_model=list[schemas.TaskListItem])
def list_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)


@api_router.get("/tasks/{task_id}", response_model=schemas.TaskDetail)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@api_router.put("/tasks/{task_id}", response_model=schemas.TaskDetail)
def update_task(
    task_id: int, task_in: schemas.TaskUpdate, db: Session = Depends(get_db)
):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return crud.update_task(db, task, task_in)


@api_router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    crud.delete_task(db, task)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


app.include_router(api_router)

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
