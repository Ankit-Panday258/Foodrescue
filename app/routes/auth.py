from flask import render_template, Blueprint, redirect, url_for, request, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.users import User
import re


auth = Blueprint('auth', __name__)


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[\d\s\-\(\)]{10,}$'
    return re.match(pattern, phone) is not None


@auth.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template("register.html")

    if request.method == 'POST':
        # Get form data
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        user_type = request.form.get('type', '').strip()

        # Validation
        errors = []

        if not username or len(username) < 2:
            errors.append("Username must be at least 2 characters long")

        if not validate_email(email):
            errors.append("Please enter a valid email address")

        if not validate_phone(phone):
            errors.append("Please enter a valid phone number")

        if len(password) < 6:
            errors.append("Password must be at least 6 characters long")

        if password != confirm_password:
            errors.append("Passwords do not match")

        if user_type not in ['donor', 'recipient', 'both']:
            errors.append("Please select a valid user type")

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            errors.append("Email already registered")

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template("register.html")

        # Create new user
        try:
            hashed_password = generate_password_hash(password)
            new_user = User(
                username=username,
                email=email,
                phone=phone,
                password=hashed_password,
                type=user_type
            )

            db.session.add(new_user)
            db.session.commit()

            # Auto-login the user after successful registration
            session['user_id'] = new_user.user_id
            session['username'] = new_user.username
            session['email'] = new_user.email
            session['user_type'] = new_user.type
            session['phone'] = new_user.phone

            flash(f"Welcome to Food Rescue, {new_user.username}! Your account has been created successfully.", 'success')
            return redirect(url_for('home.index'))

        except Exception as e:
            db.session.rollback()
            flash("Registration failed. Please try again.", 'error')
            return render_template("register.html")


@auth.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template("login.html")

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash("Please enter both email and password", 'error')
            return render_template("login.html")

        # Find user
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # Login successful
            session['user_id'] = user.user_id
            session['username'] = user.username
            session['email'] = user.email
            session['user_type'] = user.type
            session['phone'] = user.phone

            flash(f"Welcome back, {user.username}!", 'success')

            # Redirect to next page or home
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home.index'))
        else:
            flash("Invalid email or password", 'error')
            return render_template("login.html")


@auth.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out successfully", 'success')
    return redirect(url_for('home.index'))


# Utility routes for checking authentication status
@auth.route("/check-auth")
def check_auth():
    """API endpoint to check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'email': session['email'],
                'phone': session.get('phone', ''),
                'type': session['user_type']
            }
        })
    return jsonify({'authenticated': False})


@auth.route("/profile")
def profile():
    """Get current user profile"""
    if 'user_id' not in session:
        flash("Please log in to view your profile", 'error')
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash("User not found", 'error')
        return redirect(url_for('auth.login'))

    return render_template("profile.html", user=user)


# Helper function for other routes to check authentication
def login_required(f):
    """Decorator to require login for protected routes"""
    from functools import wraps

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash("Please log in to access this page", 'error')
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """Get current logged in user object"""
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None


