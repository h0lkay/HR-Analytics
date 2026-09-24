from fastapi import APIRouter
from app.api.v1.registration import router as registration_router

api_router = APIRouter()

api_router.include_router(registration_router)