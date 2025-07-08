import uuid
from app import db
from sqlalchemy import CheckConstraint
from datetime import datetime

class Claim(db.Model):
    __tablename__ = 'claims'
    
    claim_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    listing_id = db.Column(db.String(36), db.ForeignKey('listing.listing_id'), nullable=False)
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    claim_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(150), nullable=False, default='pending')
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'received')", name='check_claim_status'),
    )