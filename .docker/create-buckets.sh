#!/usr/bin/env bash
mc alias set local http://${MINIO_DOMAIN}:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb --ignore-existing local/${BUCKET}
mc policy set public local/${BUCKET}
mc anonymous set download local/${BUCKET}
mc anonymous set public local/${BUCKET}
