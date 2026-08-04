"""Initial migration baseline schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-07-25 11:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Tables are auto-created by init_db baseline script
    pass

def downgrade():
    pass
