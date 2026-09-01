from __future__ import annotations

import shutil

from config import STATE_DIR

answer = input(f"Delete the entire local RAG index at {STATE_DIR}? Type YES: ")
if answer == "YES":
    if STATE_DIR.exists():
        shutil.rmtree(STATE_DIR)
    print("Index deleted.")
else:
    print("Cancelled.")
