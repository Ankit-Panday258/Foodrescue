from app import create_app, db
from app.models.users import User
from app.models.foodlisting import Listing
from app.models.claims import Claim
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import uuid

def create_sample_data():
    app = create_app()
    
    with app.app_context():
        # Clear existing data (optional)
        db.drop_all()
        db.create_all()
        
        # Create sample users
        users_data = [
            {
                'username': 'raja',
                'email': 'raja@example.com',
                'phone': '+1234567890',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'atulya',
                'email': 'atulya@example.com',
                'phone': '+1234567891',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'vaibhav',
                'email': 'vaibhav@example.com',
                'phone': '+1234567892',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'ankit',
                'email': 'ankit@example.com',
                'phone': '+1234567892',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            },
            {
                'username': 'nitin',
                'email': 'sarah@example.com',
                'phone': '+1234567893',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        print(f"Created {len(users)} users")
        
        # Create sample food listings
        listings_data = [
            {
                'donor_id': users[0].user_id,  # raja
                'foodname': 'Fresh Vegetables',
                'description': 'Mixed vegetables from our garden - carrots, broccoli, and lettuce',
                'category': 'veg',
                'quantity': 5,
                'expiry_date': datetime.utcnow() + timedelta(days=3),
                'pickup_location': 'mere ghr pr aaja',
                'status': 'available'
            },
            {
                'donor_id': users[0].user_id,  # raja
                'foodname': 'Leftover Pizza',
                'description': 'Half pizza from last night, still fresh',
                'category': 'nonveg',
                'quantity': 1,
                'expiry_date': datetime.utcnow() + timedelta(days=1),
                'pickup_location': 'bro tu aa idhr',
                'status': 'available'
            },
            {
                'donor_id': users[1].user_id,  # 
                'foodname': 'Homemade Bread',
                'description': 'Fresh baked bread, perfect for sandwiches',
                'category': 'veg',
                'quantity': 2,
                'expiry_date': datetime.utcnow() + timedelta(days=2),
                'pickup_location': 'nhi milega',
                'status': 'claimed'
            },
            {
                'donor_id': users[2].user_id,  
                'foodname': 'Fruit Salad',
                'description': 'Mixed seasonal fruits - apples, oranges, bananas',
                'category': 'veg',
                'quantity': 3,
                'expiry_date': datetime.utcnow() + timedelta(hours=12),
                'pickup_location': 'paise le kr aana',
                'status': 'available'
            }
        ]
        
        listings = []
        for listing_data in listings_data:
            listing = Listing(**listing_data)
            db.session.add(listing)
            listings.append(listing)
        
        db.session.commit()
        print(f"Created {len(listings)} food listings")
        
        # Create sample claims
        claims_data = [
            {
                'listing_id': listings[2].listing_id,  # Claimed bread
                'recipient_id': users[3].user_id,  # alice_recipient
                'status': 'pending'
            },
            {
                'listing_id': listings[2].listing_id,  # Claimed bread
                'recipient_id': users[4].user_id,  # alice_recipient
                'status': 'pending'
            },
            {
                'listing_id': listings[0].listing_id,  # Vegetables
                'recipient_id': users[4].user_id, 
                'status': 'received'
            }
        ]
        
        claims = []
        for claim_data in claims_data:
            claim = Claim(**claim_data)
            db.session.add(claim)
            claims.append(claim)
        
        db.session.commit()
        print(f"Created {len(claims)} claims")
        
        print("Sample data created successfully!")
      
if __name__ == '__main__':
    create_sample_data()