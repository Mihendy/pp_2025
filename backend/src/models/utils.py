from sqlalchemy import Column, DateTime, func


def timestamp_columns():
    return [
        Column("created_at", DateTime, nullable=False, server_default=func.now()),
        Column("updated_at", DateTime, nullable=False, server_default=func.now(), onupdate=func.now()),
    ]
