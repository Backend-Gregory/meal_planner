"""add is_public to recipes

Revision ID: a39100365a0a
Revises: 49b08d29a10e
Create Date: 2026-10-22 19:34:43.604996

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a39100365a0a'
down_revision: Union[str, Sequence[str], None] = '49b08d29a10e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("recipes", sa.Column("is_public", sa.Boolean(), server_default="false", nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("recipes", "is_public")
