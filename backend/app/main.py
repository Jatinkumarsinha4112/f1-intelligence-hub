from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routers import races, drivers, standings, seasons, history

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="REST API powering the F1 Intelligence Hub",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(races.router,     prefix="/api/v1")
app.include_router(drivers.router,   prefix="/api/v1")
app.include_router(standings.router, prefix="/api/v1")
app.include_router(seasons.router,   prefix="/api/v1")
app.include_router(history.router,   prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
async def health():
    return JSONResponse({"status": "ok"})
