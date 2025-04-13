from databases import Database
from sqlalchemy import create_engine, MetaData
from chat_app.config import DATABASE_URL

database = Database(DATABASE_URL)
metadata = MetaData()


def create_tables():
    engine = create_engine(str(DATABASE_URL).replace("+asyncpg", ""))
    metadata.create_all(engine)
