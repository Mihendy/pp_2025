from config import DATABASE_URL
from databases import Database
from sqlalchemy import MetaData, create_engine

database = Database(DATABASE_URL)
metadata = MetaData()


def create_tables():
    engine = create_engine(str(DATABASE_URL).replace("+asyncpg", ""))
    metadata.create_all(engine)
