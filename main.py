# 1. Start Jaeger and Prometheus
docker-compose -f docker-compose.telemetry.yml up -d

# 2. Load telemetry config
source .env.telemetry

# 3. Run your app with instrumentation
opentelemetry-instrument \
    --traces_exporter otlp \
    --metrics_exporter otlp \
    --service_name axr-api \
    uvicorn api.app:app --reload --host 0.0.0.0 --port 8000