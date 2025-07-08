from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'  
    app.config['SECRET_KEY'] = 'some key'  
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Import models (important for migrations)
    from .models import User, Listing, Claim
    
    from .routes.home import home
    from .routes.food import food
    from .routes.auth import auth
    
    app.register_blueprint(home, url_prefix='/')
    app.register_blueprint(food, url_prefix='/foods')
    app.register_blueprint(auth, url_prefix='/auth')
   
    
    migrate = Migrate(app, db)
    return app