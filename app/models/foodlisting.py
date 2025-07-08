from app import db
import uuid
from sqlalchemy import CheckConstraint
from datetime import datetime

class Listing(db.Model):
    __tablename__ = 'listing'
    
    listing_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    donor_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    foodname = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    expiry_date = db.Column(db.DateTime, nullable=False)
    pickup_location = db.Column(db.String(300), nullable=False)
    status = db.Column(db.String(150), nullable=False, default='available')
    image_url = db.Column(db.String(500), nullable=False, default='https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    claims = db.relationship('Claim', backref='listing', lazy=True)
    
    __table_args__ = (
        CheckConstraint("status IN ('available', 'claimed', 'completed', 'expired')", name='check_listing_status'),
        CheckConstraint("category IN ('veg', 'nonveg')", name='check_listing_category'),
    )

