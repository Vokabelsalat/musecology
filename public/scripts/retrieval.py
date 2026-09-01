from __future__ import annotations

from collections import defaultdict

from config import (
    STATE_DIR, VECTOR_CANDIDATES, LEXICAL_CANDIDATES, TOP_K, EMBED_MODEL
)
from indexer import DB_PATH, get_collection
from lmstudio import embed_texts
from storage import connect, lexical_search, fetch_chunks

def reciprocal_rank_fusion(vector_ids: list[str], lexical_ids: list[str], k: int = 60) -> list[str]:
    scores = defaultdict(float)
    for rank, chunk_id in enumerate(vector_ids, start=1):
        scores[chunk_id] += 1.0 / (k + rank)
    for rank, chunk_id in enumerate(lexical_ids, start=1):
        scores[chunk_id] += 1.0 / (k + rank)
    return [cid for cid, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True)]

def retrieve(question: str, top_k: int = TOP_K) -> list[dict]:
    collection = get_collection()
    if collection.count() == 0:
        return []

    q_embedding = embed_texts([question])[0]
    v = collection.query(
        query_embeddings=[q_embedding],
        n_results=min(VECTOR_CANDIDATES, collection.count()),
        include=["metadatas", "documents", "distances"],
    )
    vector_ids = v["ids"][0] if v.get("ids") else []

    conn = connect(DB_PATH)
    lexical = lexical_search(conn, question, LEXICAL_CANDIDATES)
    lexical_ids = [r["chunk_id"] for r in lexical]

    fused = reciprocal_rank_fusion(vector_ids, lexical_ids)
    selected_ids = fused[: max(top_k * 2, top_k)]
    by_id = fetch_chunks(conn, selected_ids)
    conn.close()

    # Diversity rule: avoid filling the prompt with many near-adjacent chunks from one file.
    out = []
    per_file = defaultdict(int)
    for cid in selected_ids:
        row = by_id.get(cid)
        if not row:
            continue
        if per_file[row["path"]] >= 3:
            continue
        per_file[row["path"]] += 1
        out.append(row)
        if len(out) >= top_k:
            break
    return out
