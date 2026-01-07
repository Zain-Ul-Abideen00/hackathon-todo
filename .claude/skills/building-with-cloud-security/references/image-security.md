# Image Security Reference

## Trivy - Vulnerability Scanning

### Installation
```bash
# macOS
brew install trivy

# Docker
docker pull aquasec/trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

### Basic Scanning

```bash
# Scan image for vulnerabilities
trivy image python:3.12-slim

# Scan with severity filter
trivy image --severity HIGH,CRITICAL task-api:latest

# Fail on HIGH+ (for CI/CD)
trivy image --exit-code 1 --severity HIGH,CRITICAL task-api:latest

# Scan local project files
trivy fs --scanners vuln,secret,misconfig ./

# Scan Kubernetes cluster
trivy k8s --report summary cluster
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'HIGH,CRITICAL'
    exit-code: '1'

- name: Upload Trivy scan results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

### Trivy Configuration
```yaml
# trivy.yaml
severity:
  - HIGH
  - CRITICAL
exit-code: 1
ignore-unfixed: true
security-checks:
  - vuln
  - secret
  - config
```

### SBOM Generation
```bash
# Generate SPDX SBOM
trivy image --format spdx-json -o sbom.spdx.json task-api:latest

# Generate CycloneDX SBOM
trivy image --format cyclonedx -o sbom.cdx.json task-api:latest
```

## Cosign - Image Signing

### Installation
```bash
# macOS
brew install cosign

# Go install
go install github.com/sigstore/cosign/v2/cmd/cosign@latest
```

### Keyless Signing (Recommended)
```bash
# Sign image using OIDC identity (GitHub, Google, etc.)
cosign sign ghcr.io/org/task-api:v1.0.0

# This will:
# 1. Open browser for OIDC auth
# 2. Issue ephemeral certificate from Fulcio
# 3. Record signature in Rekor transparency log
# 4. Store signature in registry alongside image
```

### Key-Based Signing
```bash
# Generate key pair
cosign generate-key-pair

# Sign with private key
cosign sign --key cosign.key ghcr.io/org/task-api:v1.0.0

# Verify with public key
cosign verify --key cosign.pub ghcr.io/org/task-api:v1.0.0
```

### CI/CD Signing (GitHub Actions)
```yaml
- name: Sign image with Cosign
  uses: sigstore/cosign-installer@main

- name: Sign the published Docker image
  env:
    DIGEST: ${{ steps.build.outputs.digest }}
  run: |
    cosign sign --yes ghcr.io/${{ github.repository }}/task-api@${DIGEST}
```

### Verification
```bash
# Verify keyless signature
cosign verify ghcr.io/org/task-api:v1.0.0 \
  --certificate-identity=user@org.com \
  --certificate-oidc-issuer=https://github.com/login/oauth

# Verify with Rekor transparency log
cosign verify --rekor-url=https://rekor.sigstore.dev ghcr.io/org/task-api:v1.0.0
```

## Kubernetes Admission Control

### Kyverno Policy for Image Verification
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-images
spec:
  validationFailureAction: Enforce
  rules:
  - name: verify-signature
    match:
      any:
      - resources:
          kinds:
          - Pod
    verifyImages:
    - imageReferences:
      - "ghcr.io/org/*"
      attestors:
      - entries:
        - keyless:
            subject: "*@org.com"
            issuer: "https://github.com/login/oauth"
```

### Connaisseur (Signature Validation)
```yaml
# Connaisseur validator config
validators:
- name: cosign-validator
  type: cosign
  trustRoots:
  - name: default
    key: |
      -----BEGIN PUBLIC KEY-----
      ...
      -----END PUBLIC KEY-----
```

## Image Pinning

### Always Use Digests
```yaml
# BAD - tag can be overwritten
image: task-api:latest

# GOOD - immutable reference
image: ghcr.io/org/task-api:v1.0.0@sha256:abc123...
```

### Get Image Digest
```bash
# From registry
docker inspect --format='{{index .RepoDigests 0}}' task-api:latest

# Using crane
crane digest ghcr.io/org/task-api:v1.0.0
```

## Complete CI/CD Pipeline

```yaml
name: Build, Scan, Sign, Deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Build image
      run: docker build -t ghcr.io/${{ github.repository }}/task-api:${{ github.sha }} .

    - name: Scan for vulnerabilities
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}
        exit-code: '1'
        severity: 'HIGH,CRITICAL'

    - name: Generate SBOM
      run: |
        trivy image --format spdx-json \
          -o sbom.spdx.json \
          ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}

    - name: Push to registry
      run: docker push ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}

    - name: Sign image
      run: |
        cosign sign --yes \
          ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}

    - name: Attach SBOM
      run: |
        cosign attach sbom \
          --sbom sbom.spdx.json \
          ghcr.io/${{ github.repository }}/task-api:${{ github.sha }}
```

## Best Practices

1. **Scan before push** - Catch vulnerabilities before they reach registry
2. **Fail on HIGH+** - Block deployment of critically vulnerable images
3. **Sign all images** - Verify provenance before deployment
4. **Generate SBOMs** - Track dependencies for compliance
5. **Pin by digest** - Tags can be overwritten
6. **Use minimal base images** - python:3.12-slim, distroless, chainguard
7. **Regular rescans** - Vulnerabilities discovered after initial build
8. **Admission control** - Enforce signature verification in cluster
