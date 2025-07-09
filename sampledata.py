from app import create_app, db
from app.models.users import User
from app.models.foodlisting import Listing
from app.models.claims import Claim
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import uuid
import random

# Food image URLs from Unsplash
FOOD_IMAGE_URLS = [
    "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1661746156569-946462410cdc?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1667047165840-803e47970128?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fHZlZ2V0YWJsZXN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHZlZ2V0YWJsZXN8ZW58MHx8MHx8fDA%3D",
    "https://plus.unsplash.com/premium_photo-1671379041175-782d15092945?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZnJ1aXRzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZydWl0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGVhbHRoeXxlbnwwfHwwfHx8MA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1664302148512-ddea30cd2a92?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fGhlYWx0aHl8ZW58MHx8MHx8fDA%3D"
]

# Sample food data with realistic names and descriptions
FOOD_ITEMS = [
    {
        'name': 'Fresh Garden Vegetables',
        'description': 'A mix of fresh vegetables from our garden including carrots, broccoli, bell peppers, and lettuce. Perfect for salads and cooking.',
        'category': 'veg',
        'quantities': [3, 4, 5, 6, 7],
        'expiry_days': [2, 3, 4, 5]
    },
    {
        'name': 'Homemade Pasta',
        'description': 'Fresh pasta made this morning with herbs and tomato sauce. Serves 4-6 people.',
        'category': 'veg',
        'quantities': [1, 2, 3],
        'expiry_days': [1, 2, 3]
    },
    {
        'name': 'Assorted Fruits',
        'description': 'Fresh seasonal fruits including apples, bananas, oranges, and grapes. Great for smoothies or snacking.',
        'category': 'veg',
        'quantities': [4, 5, 6, 8, 10],
        'expiry_days': [1, 2, 3, 4]
    },
    {
        'name': 'Artisan Bread',
        'description': 'Freshly baked sourdough bread, perfect for sandwiches and toast. Made with organic flour.',
        'category': 'veg',
        'quantities': [1, 2, 3],
        'expiry_days': [2, 3, 4]
    },
    {
        'name': 'Grilled Chicken',
        'description': 'Marinated and grilled chicken breast with herbs. Cooked today and ready to eat.',
        'category': 'nonveg',
        'quantities': [2, 3, 4],
        'expiry_days': [1, 2]
    },
    {
        'name': 'Vegetable Curry',
        'description': 'Spicy vegetable curry with potatoes, cauliflower, and peas. Homemade with love.',
        'category': 'veg',
        'quantities': [1, 2, 3],
        'expiry_days': [2, 3, 4]
    },
    {
        'name': 'Fish Tacos',
        'description': 'Fresh fish tacos with cabbage slaw and lime crema. Made with sustainable fish.',
        'category': 'nonveg',
        'quantities': [4, 6, 8],
        'expiry_days': [1, 2]
    },
    {
        'name': 'Organic Salad Mix',
        'description': 'Pre-washed organic salad greens with cherry tomatoes and cucumber. Perfect for healthy meals.',
        'category': 'veg',
        'quantities': [2, 3, 4],
        'expiry_days': [1, 2, 3]
    },
    {
        'name': 'Homemade Pizza',
        'description': 'Wood-fired pizza with fresh mozzarella, basil, and tomato sauce. Half eaten but still delicious.',
        'category': 'veg',
        'quantities': [1, 2],
        'expiry_days': [1, 2]
    },
    {
        'name': 'Beef Stir Fry',
        'description': 'Tender beef strips with mixed vegetables in savory sauce. Served over rice.',
        'category': 'nonveg',
        'quantities': [2, 3, 4],
        'expiry_days': [1, 2]
    },
    {
        'name': 'Smoothie Bowl',
        'description': 'Healthy smoothie bowl with acai, banana, granola, and fresh berries. Nutritious and delicious.',
        'category': 'veg',
        'quantities': [1, 2, 3],
        'expiry_days': [1, 2]
    },
    {
        'name': 'Sandwich Platter',
        'description': 'Assorted sandwiches with various fillings including turkey, ham, and veggie options.',
        'category': 'nonveg',
        'quantities': [6, 8, 10, 12],
        'expiry_days': [1, 2]
    }
]

# Realistic pickup locations
PICKUP_LOCATIONS = [
    "Downtown Community Center, Main Street",
    "University Campus, Student Union Building",
    "Northside Park, Pavilion Area",
    "Southside Shopping Mall, Food Court",
    "Central Library, Main Entrance",
    "Eastside Coffee Shop, 123 Oak Street",
    "Westside Metro Station, Exit A",
    "Midtown Apartment Complex, Lobby",
    "Riverside Park, Picnic Area",
    "City Hall, Front Steps",
    "Local Grocery Store, Parking Lot",
    "Community Garden, Tool Shed",
    "School Parking Lot, Visitor Area",
    "Church Community Hall, Side Entrance",
    "Neighborhood Bakery, Back Door"
]

def create_sample_data():
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create sample users
        users_data = [
            # Donors
            {
                'username': 'chef_maria',
                'email': 'maria@example.com',
                'phone': '+1234567890',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'baker_john',
                'email': 'john@example.com',
                'phone': '+1234567891',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'garden_sarah',
                'email': 'sarah@example.com',
                'phone': '+1234567892',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'restaurant_raj',
                'email': 'raj@example.com',
                'phone': '+1234567893',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'cafe_lily',
                'email': 'lily@example.com',
                'phone': '+1234567894',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            {
                'username': 'farmer_tom',
                'email': 'tom@example.com',
                'phone': '+1234567895',
                'password': generate_password_hash('password123'),
                'type': 'donor'
            },
            # Recipients
            {
                'username': 'student_alex',
                'email': 'alex@example.com',
                'phone': '+1234567896',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            },
            {
                'username': 'family_maya',
                'email': 'maya@example.com',
                'phone': '+1234567897',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            },
            {
                'username': 'senior_robert',
                'email': 'robert@example.com',
                'phone': '+1234567898',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            },
            {
                'username': 'working_mom',
                'email': 'jessica@example.com',
                'phone': '+1234567899',
                'password': generate_password_hash('password123'),
                'type': 'recipient'
            },
            # Both types
            {
                'username': 'community_helper',
                'email': 'helper@example.com',
                'phone': '+1234567800',
                'password': generate_password_hash('password123'),
                'type': 'both'
            },
            {
                'username': 'volunteer_sam',
                'email': 'sam@example.com',
                'phone': '+1234567801',
                'password': generate_password_hash('password123'),
                'type': 'both'
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.session.add(user)
            users.append(user)
        
        db.session.commit()
        print(f"Created {len(users)} users")
        
        # Create food listings
        listings = []
        donors = [u for u in users if u.type in ['donor', 'both']]
        
        # Create 20-25 food listings
        for i in range(25):
            food_item = random.choice(FOOD_ITEMS)
            donor = random.choice(donors)
            
            # Random time offsets for created_at
            hours_ago = random.randint(1, 72)
            created_time = datetime.utcnow() - timedelta(hours=hours_ago)
            
            # Random expiry date
            expiry_days = random.choice(food_item['expiry_days'])
            expiry_date = created_time + timedelta(days=expiry_days)
            
            # Random status
            status_choices = ['available', 'claimed', 'completed', 'expired']
            status_weights = [0.6, 0.2, 0.15, 0.05]  # Most items available
            status = random.choices(status_choices, weights=status_weights)[0]
            
            # If expired, make sure expiry date is in the past
            if status == 'expired':
                expiry_date = datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            
            listing_data = {
                'donor_id': donor.user_id,
                'foodname': food_item['name'],
                'description': food_item['description'],
                'category': food_item['category'],
                'quantity': random.choice(food_item['quantities']),
                'expiry_date': expiry_date,
                'pickup_location': random.choice(PICKUP_LOCATIONS),
                'status': status,
                'image_url': FOOD_IMAGE_URLS[i % len(FOOD_IMAGE_URLS)],
                'created_at': created_time
            }
            
            listing = Listing(**listing_data)
            db.session.add(listing)
            listings.append(listing)
        
        db.session.commit()
        print(f"Created {len(listings)} food listings")
        
        # Create claims for some listings
        recipients = [u for u in users if u.type in ['recipient', 'both']]
        claimed_listings = [l for l in listings if l.status in ['claimed', 'completed']]
        
        claims = []
        for listing in claimed_listings:
            # Create 1-3 claims per claimed listing
            num_claims = random.randint(1, 3)
            claim_recipients = random.sample(recipients, min(num_claims, len(recipients)))
            
            for i, recipient in enumerate(claim_recipients):
                # First claim gets the listing, others are just additional claims
                claim_status = 'received' if i == 0 and listing.status == 'completed' else 'pending'
                
                # Random claim time between listing creation and now
                claim_time = listing.created_at + timedelta(
                    minutes=random.randint(30, int((datetime.utcnow() - listing.created_at).total_seconds() / 60))
                )
                
                claim_data = {
                    'listing_id': listing.listing_id,
                    'recipient_id': recipient.user_id,
                    'claim_datetime': claim_time,
                    'status': claim_status
                }
                
                claim = Claim(**claim_data)
                db.session.add(claim)
                claims.append(claim)
        
        db.session.commit()
        print(f"Created {len(claims)} claims")
        
        # Print summary statistics
        print("\n=== Sample Data Summary ===")
        print(f"Total Users: {len(users)}")
        print(f"- Donors: {len([u for u in users if u.type == 'donor'])}")
        print(f"- Recipients: {len([u for u in users if u.type == 'recipient'])}")
        print(f"- Both: {len([u for u in users if u.type == 'both'])}")
        
        print(f"\nTotal Food Listings: {len(listings)}")
        print(f"- Available: {len([l for l in listings if l.status == 'available'])}")
        print(f"- Claimed: {len([l for l in listings if l.status == 'claimed'])}")
        print(f"- Completed: {len([l for l in listings if l.status == 'completed'])}")
        print(f"- Expired: {len([l for l in listings if l.status == 'expired'])}")
        
        print(f"\nVegetarian Items: {len([l for l in listings if l.category == 'veg'])}")
        print(f"Non-Vegetarian Items: {len([l for l in listings if l.category == 'nonveg'])}")
        
        print(f"\nTotal Claims: {len(claims)}")
        print(f"- Pending: {len([c for c in claims if c.status == 'pending'])}")
        print(f"- Received: {len([c for c in claims if c.status == 'received'])}")
        
        print("\nSample data created successfully!")
      
if __name__ == '__main__':
    create_sample_data()