from fastapi import APIRouter, FastAPI

app = FastAPI(title="TaskFlow Pro API")

api_router = APIRouter(prefix="/api")


@api_router.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(api_router)
