#!/bin/bash
set -e

# Function to show usage
usage() {
    echo "Usage: $0 --name <instance-name> [--port <port>] [--id <instance-id>] [--quiet]"
    echo ""
    echo "Examples:"
    echo "  $0 --name client1"
    echo "  $0 --name staging --port 9000"
    echo "  $0 --name test --id logic-test123"
    echo "  $0 --name prod --quiet"
    exit 1
}

# Parse arguments
INSTANCE_NAME=""
PORT=""
INSTANCE_ID=""
QUIET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            INSTANCE_NAME="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --id)
            INSTANCE_ID="$2"
            shift 2
            ;;
        --quiet)
            QUIET="true"
            shift
            ;;
        *)
            usage
            ;;
    esac
done

# Validate required arguments
if [ -z "$INSTANCE_NAME" ]; then
    echo "❌ Error: --name is required"
    usage
fi

# Sanitize instance name (convert to valid container name)
# Remove dangerous characters and convert to lowercase
SANITIZED_NAME="${INSTANCE_NAME//[^a-zA-Z0-9_-]/-}"
SANITIZED_NAME="${SANITIZED_NAME,,}"
CONTAINER_NAME="logic-${SANITIZED_NAME}"
VOLUME_NAME="${CONTAINER_NAME}-data"

# Generate unique ID if not provided
if [ -z "$INSTANCE_ID" ]; then
    INSTANCE_ID="logic-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -c1-8)"
fi

echo "🚀 Deploying LogicAI-N8N Instance"
echo "================================"
echo "Instance Name: $INSTANCE_NAME"
echo "Container Name: $CONTAINER_NAME"
echo "Instance ID: $INSTANCE_ID"
echo "Volume: $VOLUME_NAME"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container $CONTAINER_NAME already exists"
    echo "   Remove it first: docker rm -f $CONTAINER_NAME"
    exit 1
fi

# Find available port if not specified
if [ -z "$PORT" ]; then
    # Try ports from 8080 upwards
    for TRY_PORT in {8080..9999}; do
        if ! docker ps --format '{{.Ports}}' | grep -q ":${TRY_PORT}->"; then
            PORT=$TRY_PORT
            break
        fi
    done

    if [ -z "$PORT" ]; then
        echo "❌ Error: No available port found in range 8080-9999"
        exit 1
    fi
fi

echo "Port: $PORT"
echo ""

# Build image if needed
echo "🔨 Building Docker image..."
docker build -t logicai-n8n:latest . > /dev/null 2>&1
echo "✅ Build complete"

# Create container
echo "📦 Creating container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -v $VOLUME_NAME:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e INSTANCE_ID="$INSTANCE_ID" \
  -e INSTANCE_NAME="$INSTANCE_NAME" \
  -e EXTERNAL_PORT="$PORT" \
  -e JWT_SECRET="logicai-instance-secret-key-change-in-production" \
  --restart unless-stopped \
  logicai-n8n:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps --filter "name=${CONTAINER_NAME}" --format '{{.Status}}' | grep -q "Up"; then
    echo "✅ Container started successfully"
else
    echo "❌ Error: Container failed to start"
    docker logs $CONTAINER_NAME | tail -20
    exit 1
fi

# Display access information
echo ""
echo "================================"
echo "✨ Instance deployed successfully!"
echo "================================"
echo "Instance ID:   $INSTANCE_ID"
echo "Instance Name: $INSTANCE_NAME"
echo "Container:     $CONTAINER_NAME"
echo "Access URL:    http://localhost:$PORT"
echo "Volume:        $VOLUME_NAME"
echo ""
echo "📝 Useful commands:"
echo "   View logs:   docker logs -f $CONTAINER_NAME"
echo "   Stop:        docker stop $CONTAINER_NAME"
echo "   Start:       docker start $CONTAINER_NAME"
echo "   Remove:      docker rm -f $CONTAINER_NAME"
echo "   Shell access: docker exec -it $CONTAINER_NAME sh"
echo ""

# Open browser if not quiet mode
if [ "$QUIET" != "true" ]; then
    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:$PORT
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:$PORT 2>/dev/null || echo "Open manually: http://localhost:$PORT"
    fi
fi

echo "Done! 🎉"
