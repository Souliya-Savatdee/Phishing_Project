from app import create_app
from config import DevConfig # Import your configuration class
import os
if __name__ == "__main__":
    app = create_app(DevConfig)  # Pass the configuration object to create_app
    os.makedirs("clone/landing_page", exist_ok=True)
    app.run()