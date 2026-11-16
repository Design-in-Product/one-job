"""
The test harness must never reach a real database (2026-11-15).

`main` builds its engine when it is imported, from DATABASE_URL (default
`sqlite:///./onejob.db`), and runs `Base.metadata.create_all` against it.
Until this date, a pytest run therefore created or altered `onejob.db`
in whatever directory it ran from, while conftest's docstring promised
no .db files on disk. Reproduced in a scratch copy: a 40 KB onejob.db
appeared after four passing tests.

Isolation is the harness's default (conftest forces an in-memory URL
before importing main), not a flag a run must remember (Piper Morgan's
pattern, via the 11-15 brief).
"""

import os

import main


def test_module_engine_is_in_memory():
    assert str(main.engine.url) == "sqlite://"


def test_importing_main_left_no_database_file():
    assert not os.path.exists("onejob.db")
