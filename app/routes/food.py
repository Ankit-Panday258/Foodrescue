from flask import render_template, Blueprint, redirect, url_for, request, flash, session, jsonify, jsonify
from app.routes.auth import login_required, get_current_user
from app.models import Listing, Claim, User
from app import db
from datetime import datetime


food = Blueprint('food', __name__)

@food.route('/')
def allListing():
    """Public route - no authentication required"""
    # Base query for available listings
    query = Listing.query.filter_by(status='available')
    
    # Get filter parameters
    category_filter = request.args.get('category')
    location_filter = request.args.get('location')
    expiry_date_filter = request.args.get('expiry_date')
    
    # Apply filters
    if category_filter:
        query = query.filter(Listing.category == category_filter)
    
    if location_filter:
        query = query.filter(Listing.pickup_location.ilike(f'%{location_filter}%'))
    
    if expiry_date_filter:
        try:
            expiry_date = datetime.strptime(expiry_date_filter, '%Y-%m-%d')
            query = query.filter(Listing.expiry_date <= expiry_date)
        except ValueError:
            flash("Invalid date format", 'error')
    
    # Order by creation date (newest first)
    listings = query.order_by(Listing.created_at.desc()).all()
    
    return render_template("listing.html", 
                         listings=listings, 
                         now=datetime.now(),
                         category_filter=category_filter,
                         location_filter=location_filter,
                         expiry_date_filter=expiry_date_filter)

#New route
@food.route("/new")
@login_required
def renderNewForm():
    return render_template("new.html")

#Create route
@food.route("/", methods=["POST"])
@login_required
def createListing():
    current_user = get_current_user()

    # Donor or both logic
    if current_user.type not in ['donor', 'both']:
        flash("Only donors can create food listings", 'error')
        return redirect(url_for('food.allListing'))

    try:
        # Get form data and convert to dict
        form_data = request.form.to_dict()

        # Data type conversions and processing
        # form_data['quantity'] = int(form_data['quantity'])
        form_data['quantity'] = 1

        form_data['expiry_date'] = datetime.strptime(form_data['expiry_date'], '%Y-%m-%d')

        # Remove empty image_url to allow default value to be used
        if 'image_url' in form_data and not form_data['image_url'].strip():
            del form_data['image_url']

        # Associate listing with current user
        form_data['donor_id'] = current_user.user_id

        # Create new listing using dictionary unpacking
        new_listing = Listing(**form_data)

        db.session.add(new_listing)
        db.session.commit()

        flash("Food listing created successfully!", 'success')
        return redirect(url_for('food.allListing'))

    except ValueError as e:
        flash("Invalid date format or quantity", 'error')
        return render_template("new.html")
    except Exception as e:
        db.session.rollback()
        flash("Error creating listing. Please try again.", 'error')
        return render_template("new.html")

#Show route
@food.route("/<id>")
def showListing(id):
    listing = Listing.query.get_or_404(id)
    donor = User.query.get(listing.donor_id)

    # Check if current user has already claimed this item
    user_claim = None
    if 'user_id' in session:
        user_claim = Claim.query.filter_by(
            listing_id=id,
            recipient_id=session['user_id']
        ).first()

    return render_template("show.html", listing=listing, donor=donor, user_claim=user_claim)

#Edit route
@food.route("/<id>/edit")
@login_required
def renderEditForm(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Only the donor can edit it
    if listing.donor_id != current_user.user_id:
        flash("You can only edit your own listings", 'error')
        return redirect(url_for('food.showListing', id=id))

    return render_template("edit.html", listing=listing)

#Update route
@food.route("/<id>", methods=["POST"])
@login_required
def updateListing(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Only the donor can update it
    if listing.donor_id != current_user.user_id:
        flash("You can only edit your own listings", 'error')
        return redirect(url_for('food.showListing', id=id))

    try:
        # Get form data and convert to dict
        form_data = request.form.to_dict()

        # Data type conversions and processing
        if 'quantity' in form_data:
            # form_data['quantity'] = int(form_data['quantity'])
            form_data['quantity'] = 1

        if 'expiry_date' in form_data and form_data['expiry_date']:
            form_data['expiry_date'] = datetime.strptime(form_data['expiry_date'], '%Y-%m-%d')

        # Remove empty image_url to keep existing value
        if 'image_url' in form_data and not form_data['image_url'].strip():
            del form_data['image_url']

        # Update listing attributes using dictionary unpacking
        for key, value in form_data.items():
            if hasattr(listing, key):
                setattr(listing, key, value)

        db.session.commit()
        flash("Listing updated successfully!", 'success')
        return redirect(url_for('food.showListing', id=id))

    except ValueError as e:
        flash("Invalid date format or quantity", 'error')
        return render_template("edit.html", listing=listing)
    except Exception as e:
        db.session.rollback()
        flash("Error updating listing. Please try again.", 'error')
        return render_template("edit.html", listing=listing)

#Delete route
@food.route("/<id>/delete", methods=["POST"])
@login_required
def destroyListing(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Only the donor can delete it
    if listing.donor_id != current_user.user_id:
        flash("You can only delete your own listings", 'error')
        return redirect(url_for('food.showListing', id=id))

    try:
        # Delete associated claims first
        Claim.query.filter_by(listing_id=id).delete()
        db.session.delete(listing)
        db.session.commit()
        flash("Listing deleted successfully!", 'success')
        return redirect(url_for('food.allListing'))
    except Exception as e:
        db.session.rollback()
        flash("Error deleting listing. Please try again.", 'error')
        return redirect(url_for('food.showListing', id=id))

#Claims routes

#Render claim page
@food.route("/claim-now/<id>")
@login_required
def renderClaimPage(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Check if user can claim
    if current_user.type not in ['recipient', 'both']:
        flash("Only recipients can claim food items", 'error')
        return redirect(url_for('food.showListing', id=id))

    # Check if listing is available
    if listing.status != 'available':
        flash("This item is no longer available for claiming", 'error')
        return redirect(url_for('food.showListing', id=id))

    # Check if user has already claimed this item
    existing_claim = Claim.query.filter_by(
        listing_id=id,
        recipient_id=current_user.user_id
    ).first()

    if existing_claim:
        flash("You have already claimed this item", 'info')
        return redirect(url_for('food.showListing', id=id))

    # Check if user is trying to claim their own listing
    if listing.donor_id == current_user.user_id:
        flash("You cannot claim your own listing", 'error')
        return redirect(url_for('food.showListing', id=id))

    donor = User.query.get(listing.donor_id)
    return render_template("claim.html", listing=listing, donor=donor)

#Process claim
@food.route("/claim-now/<id>", methods=["POST"])
@login_required
def processClaim(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Validate user can claim
    if current_user.type not in ['recipient', 'both']:
        flash("Only recipients can claim food items", 'error')
        return redirect(url_for('food.showListing', id=id))

    # Check if listing is available
    if listing.status != 'available':
        flash("This item is no longer available for claiming", 'error')
        return redirect(url_for('food.showListing', id=id))

    # Check if user has already claimed this item
    existing_claim = Claim.query.filter_by(
        listing_id=id,
        recipient_id=current_user.user_id
    ).first()

    if existing_claim:
        flash("You have already claimed this item", 'info')
        return redirect(url_for('food.showListing', id=id))

    # Check if user is trying to claim their own listing
    if listing.donor_id == current_user.user_id:
        flash("You cannot claim your own listing", 'error')
        return redirect(url_for('food.showListing', id=id))

    # Validate required form fields
    if not request.form.get('agree_terms'):
        flash("You must agree to the terms and conditions to proceed", 'error')
        return redirect(url_for('food.renderClaimPage', id=id))

    if not request.form.get('contact_donor'):
        flash("You must agree to contact the donor within 24 hours to proceed", 'error')
        return redirect(url_for('food.renderClaimPage', id=id))
        
    if not request.form.get('food_safety'):
        flash("You must acknowledge food safety responsibility to proceed", 'error')
        return redirect(url_for('food.renderClaimPage', id=id))

    try:
        # Create new claim with additional data
        claim_data = {
            'listing_id': id,
            'recipient_id': current_user.user_id,
            'status': 'pending'
        }

        new_claim = Claim(**claim_data)

        # Update listing status to claimed
        listing.status = 'claimed'

        db.session.add(new_claim)
        db.session.commit()

        flash("Food item claimed successfully! Please contact the donor for pickup details.", 'success')
        return redirect(url_for('food.showListing', id=id))

    except Exception as e:
        db.session.rollback()
        flash("Error processing claim. Please try again.", 'error')
        return redirect(url_for('food.renderClaimPage', id=id))

# Cancel claim route
@food.route("/cancel-claim/<id>", methods=["POST"])
@login_required
def cancelClaim(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()

    # Find the user's claim
    user_claim = Claim.query.filter_by(
        listing_id=id,
        recipient_id=current_user.user_id
    ).first()

    if not user_claim:
        flash("You have not claimed this item", 'error')
        return redirect(url_for('food.showListing', id=id))

    try:
        # Delete the claim
        db.session.delete(user_claim)
        
        # Update listing status back to available
        listing.status = 'available'
        
        db.session.commit()
        
        flash("Your claim has been cancelled successfully", 'success')
        return redirect(url_for('food.showListing', id=id))
        
    except Exception as e:
        db.session.rollback()
        flash("Error cancelling claim. Please try again.", 'error')
        return redirect(url_for('food.showListing', id=id))

# Add a route to get claim status via AJAX
@food.route("/api/claim-status/<id>")
@login_required
def getClaimStatus(id):
    listing = Listing.query.get_or_404(id)
    current_user = get_current_user()
    
    # Check if user has already claimed this item
    user_claim = Claim.query.filter_by(
        listing_id=id,
        recipient_id=current_user.user_id
    ).first()
    
    return jsonify({
        'has_claimed': user_claim is not None,
        'listing_status': listing.status,
        'can_claim': (listing.status == 'available' and 
                      user_claim is None and 
                      listing.donor_id != current_user.user_id and
                      current_user.type in ['recipient', 'both'])
    })
