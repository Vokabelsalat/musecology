from __future__ import annotations

import hashlib
from pathlib import Path

import chromadb

from chunking import chunk_blocks
from config import (
    RAG_ROOT, STATE_DIR, SUPPORTED_SUFFIXES, SKIP_DIR_NAMES,
    TARGET_CHARS, OVERLAP_CHARS, EMBED_BATCH_SIZE, EMBED_MODEL,
)
from lmstudio import embed_texts
from parsers import parse_file
from storage import connect, delete_path, get_file, insert_chunks, upsert_file

DB_PATH = STATE_DIR / "manifest.sqlite3"
CHROMA_PATH = STATE_DIR / "chroma"

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def iter_files(root: Path):
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if any(part in SKIP_DIR_NAMES for part in p.parts):
            continue
        if p.suffix.lower() in SUPPORTED_SUFFIXES:
            yield p

def get_collection():
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return client.get_or_create_collection(
        name="documents",
        metadata={
            "description": "Local RAG document chunks",
            "embedding_model": EMBED_MODEL,
        },
    )

def _delete_from_chroma(collection, ids: list[str]) -> None:
    if ids:
        collection.delete(ids=ids)

def index_one(path: Path, collection, conn) -> tuple[str, int]:
    rel = str(path.resolve().relative_to(RAG_ROOT))
    stat = path.stat()
    prev = get_file(conn, rel)

    # Cheap unchanged check first. Hash only if metadata changed.
    if prev and prev["size"] == stat.st_size and prev["mtime_ns"] == stat.st_mtime_ns:
        return "unchanged", 0

    digest = sha256_file(path)
    if prev and prev["sha256"] == digest:
        upsert_file(conn, path=rel, size=stat.st_size, mtime_ns=stat.st_mtime_ns, sha256=digest)
        return "unchanged", 0

    old_ids = delete_path(conn, rel)
    _delete_from_chroma(collection, old_ids)

    blocks = parse_file(path)
    pieces = chunk_blocks(blocks, TARGET_CHARS, OVERLAP_CHARS)

    rows = []
    for i, piece in enumerate(pieces):
        chunk_id = hashlib.sha256(f"{rel}\0{digest}\0{i}".encode()).hexdigest()
        rows.append({
            "chunk_id": chunk_id,
            "path": rel,
            "title": piece["title"] or path.stem,
            "location": piece["location"] or "",
            "text": piece["text"],
        })

    for start in range(0, len(rows), EMBED_BATCH_SIZE):
        batch = rows[start:start + EMBED_BATCH_SIZE]
        embeddings = embed_texts([r["text"] for r in batch])
        collection.add(
            ids=[r["chunk_id"] for r in batch],
            documents=[r["text"] for r in batch],
            embeddings=embeddings,
            metadatas=[
                {
                    "path": r["path"],
                    "title": r["title"],
                    "location": r["location"],
                }
                for r in batch
            ],
        )

    insert_chunks(conn, rows)
    upsert_file(conn, path=rel, size=stat.st_size, mtime_ns=stat.st_mtime_ns, sha256=digest)
    return "indexed", len(rows)

def remove_deleted(current_paths: set[str], collection, conn) -> int:
    stored = [r["path"] for r in conn.execute("SELECT path FROM files")]
    removed = 0
    for rel in stored:
        if rel not in current_paths:
            old_ids = delete_path(conn, rel)
            _delete_from_chroma(collection, old_ids)
            removed += 1
    return removed

def index_all() -> dict:
    if not RAG_ROOT.exists():
        raise RuntimeError(f"RAG_ROOT does not exist: {RAG_ROOT}")

    collection = get_collection()
    conn = connect(DB_PATH)

    scanned = indexed = unchanged = failed = chunks = 0
    current_paths: set[str] = set()

    for path in iter_files(RAG_ROOT):
        scanned += 1
        rel = str(path.resolve().relative_to(RAG_ROOT))
        current_paths.add(rel)
        try:
            status, n = index_one(path, collection, conn)
            if status == "indexed":
                indexed += 1
                chunks += n
                print(f"[indexed] {rel} ({n} chunks)")
            else:
                unchanged += 1
        except Exception as e:
            failed += 1
            print(f"[failed]  {rel}: {e}")

    removed = remove_deleted(current_paths, collection, conn)
    conn.close()

    return {
        "scanned": scanned,
        "indexed_or_updated": indexed,
        "unchanged": unchanged,
        "deleted_removed": removed,
        "failed": failed,
        "new_chunks": chunks,
        "collection_chunks": collection.count(),
    }

if __name__ == "__main__":
    print(index_all())
