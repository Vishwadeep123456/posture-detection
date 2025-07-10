# Use Python base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy all files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (for gunicorn)
EXPOSE 8000

# Run the Flask app via gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
