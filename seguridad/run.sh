#!/bin/bash
echo "Starting BsltProject application..."
cd "$(dirname "$0")"
if [ -f "./mvnw" ]; then
    ./mvnw spring-boot:run
else
    mvn spring-boot:run
fi
