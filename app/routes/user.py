from flask import render_template, Blueprint, redirect, url_for
from app.routes.auth import login_required, get_current_user
from app.models import Listing, Claim, User
from app import db

user = Blueprint('user', __name__)

@user.route("/profile")
@login_required
def renderProfile():
    current_user = get_current_user()
    
    # Get user statistics
    total_listings = Listing.query.filter_by(donor_id=current_user.user_id).count()
    active_listings = Listing.query.filter_by(donor_id=current_user.user_id, status='available').count()
    claimed_listings = Listing.query.filter_by(donor_id=current_user.user_id, status='claimed').count()
    completed_listings = Listing.query.filter_by(donor_id=current_user.user_id, status='completed').count()
    
    total_claims = Claim.query.filter_by(recipient_id=current_user.user_id).count()
    pending_claims = Claim.query.filter_by(recipient_id=current_user.user_id, status='pending').count()
    received_claims = Claim.query.filter_by(recipient_id=current_user.user_id, status='received').count()
    
    # Recent activities
    recent_listings = Listing.query.filter_by(donor_id=current_user.user_id).order_by(Listing.created_at.desc()).limit(5).all()
    recent_claims = Claim.query.filter_by(recipient_id=current_user.user_id).order_by(Claim.claim_datetime.desc()).limit(5).all()
    
    profile_data = {
        'user': current_user,
        'stats': {
            'total_listings': total_listings,
            'active_listings': active_listings,
            'claimed_listings': claimed_listings,
            'completed_listings': completed_listings,
            'total_claims': total_claims,
            'pending_claims': pending_claims,
            'received_claims': received_claims
        },
        'recent_listings': recent_listings,
        'recent_claims': recent_claims
    }
    
    return render_template("profile.html", **profile_data)

@user.route("/my-listings")
@login_required
def myListings():
    """Show current user's user listings"""
    current_user = get_current_user()
    listings = Listing.query.filter_by(donor_id=current_user.user_id).all()
    return render_template("my_listing.html", listings=listings)

@user.route("/my-claims")
@login_required
def myClaims():
    """Show current user's claims"""
    current_user = get_current_user()
    claims = Claim.query.filter_by(recipient_id=current_user.user_id).all()
    return render_template("my_claims.html", claims=claims)