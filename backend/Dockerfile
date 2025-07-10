# Use official Python image
FROM python:3.9

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Flask or Gunicorn will run on
EXPOSE 8000

# Start the Flask app using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
