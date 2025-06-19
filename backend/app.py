from flask import Flask
from flask_cors import CORS
from routes.search import search_bp


app = Flask(__name__)

# Configure CORS to allow all origins
# This is useful for development, but consider restricting origins in production
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(search_bp, url_prefix="/search")

if __name__ == "__main__":
    app.run(debug=True)
