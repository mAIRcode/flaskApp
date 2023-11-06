from sqlalchemy import Column, String, Integer, Date, Float
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Item(db.Model):
    __tablename__ = 'item'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100))
    date = Column(Date)
    create_ts = db.Column(db.DateTime, server_default=db.func.now())
    update_ts = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    value = Column(Float)
    state = Column(Integer())
    approval = Column(Integer(), default=0)


class Log(db.Model):
    __tablename__ = 'log'

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    user = Column(String(100))
    create_ts = db.Column(db.DateTime, server_default=db.func.now())
    update_ts = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    name = Column(String(100))
    date = Column(Date)
    value = Column(Float)
    state = Column(Integer())
    approval = Column(Integer(), default=0)
