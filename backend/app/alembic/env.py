import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Ensure both backend parent directory and app directory are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/app/alembic
app_dir = os.path.dirname(current_dir)                     # .../backend/app
backend_dir = os.path.dirname(app_dir)                     # .../backend

sys.path.insert(0, backend_dir)
sys.path.insert(0, app_dir)

try:
    from app.database.session import Base
    from app.models.domain import *  # Import all ORM models for autogenerate
    from app.config import settings
except ModuleNotFoundError:
    from database.session import Base
    from models.domain import *
    from config import settings

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
