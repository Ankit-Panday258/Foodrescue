import uuid
from app import db
from sqlalchemy import CheckConstraint
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False) 
    password = db.Column(db.String(150), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    listings = db.relationship('Listing', backref='donor', lazy=True)
    claims = db.relationship('Claim', backref='recipient', lazy=True)
    
    __table_args__ = (
        CheckConstraint("type IN ('donor', 'recipient', 'both')", name='check_user_type'),
    )



