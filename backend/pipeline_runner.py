import os
import asyncio
from pathlib import Path

from db_config import AsyncSessionLocal
from database import update_pipeline_run, finalize_ticker_from_metadata


def _exec_notebook(notebook_path: Path, *, cwd: Path, env: dict, timeout_s: int = 1800) -> None:
    # Lazy import so server doesn't crash at startup if deps aren't installed yet
    try:
        import nbformat  # type: ignore
        from nbclient import NotebookClient  # type: ignore
    except ModuleNotFoundError as e:
        raise RuntimeError(
            "Notebook execution dependencies missing. Install backend requirements (nbformat, nbclient)."
        ) from e

    nb = nbformat.read(str(notebook_path), as_version=4)
    old_env = os.environ.copy()
    try:
        os.environ.update(env)
        client = NotebookClient(
            nb,
            timeout=timeout_s,
            kernel_name="python3",
            resources={"metadata": {"path": str(cwd)}},
        )
        client.execute()
    finally:
        os.environ.clear()
        os.environ.update(old_env)


async def run_ticker_pipeline(ticker: str, run_id: int) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    nb1 = repo_root / "notebooks" / "01_EDA_Preprocessing.ipynb"
    nb2 = repo_root / "notebooks" / "02_Model_Experiments.ipynb"

    if not nb1.exists() or not nb2.exists():
        async with AsyncSessionLocal() as s:
            await update_pipeline_run(
                s, run_id, status="error", stage="queued", progress=0.0,
                message="Notebook(s) missing", error=f"Missing: {nb1} or {nb2}"
            )
        return

    env = {"TICKER": ticker}

    try:
        async with AsyncSessionLocal() as s:
            await update_pipeline_run(s, run_id, status="running", stage="eda", progress=5.0, message="Running EDA/Preprocessing")

        await asyncio.to_thread(_exec_notebook, nb1, cwd=repo_root, env=env)

        async with AsyncSessionLocal() as s:
            await update_pipeline_run(s, run_id, status="running", stage="experiments", progress=55.0, message="Running Model Experiments")

        await asyncio.to_thread(_exec_notebook, nb2, cwd=repo_root, env=env)

        async with AsyncSessionLocal() as s:
            await update_pipeline_run(s, run_id, status="running", stage="finalize", progress=90.0, message="Finalizing artifacts")
            await finalize_ticker_from_metadata(s, ticker)
            await update_pipeline_run(s, run_id, status="success", stage="done", progress=100.0, message="Completed")

    except Exception as e:
        async with AsyncSessionLocal() as s:
            await update_pipeline_run(
                s, run_id, status="error", stage="error", progress=100.0,
                message="Failed", error=str(e)
            )


def run_ticker_pipeline_sync(ticker: str, run_id: int) -> None:
    asyncio.run(run_ticker_pipeline(ticker, run_id))
