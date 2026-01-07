# FastAPI JWT Integration Patterns

> **User Choice Protocol:**
> - **Choose Pattern A (Shared Secret)** if you want **simplicity** and **speed** (Zero-Network verification). Ideal for Hackathons or internal microservices.
> - **Choose Pattern B (JWKS)** if you want **industry-standard security** with key rotation. Ideal for public APIs or large teams.

---

## Pattern A: Shared Secret (HS256) - **The "Easiest" Path**

**Why:** No network calls from IDP. Single env var (`BETTER_AUTH_SECRET`). Extremely fast.
**Trade-off:** Manual key rotation (must update env vars everywhere).

### 1. Frontend Configuration (Next.js)

Better Auth defaults to `RS256` (Public/Private Key). We must **override** the `sign` method to force `HS256` with our shared secret.

> **Install:** `pnpm add jose`

```typescript
// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { SignJWT } from "jose";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET, // Must allow this env var to be accessed
    plugins: [
        jwt({
            jwt: {
                // OVERRIDE: Sign with Shared Secret (HS256) instead of default RS256
                sign: async (payload) => {
                    // 1. Encode secret
                    const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);

                    // 2. Sign manually
                    return await new SignJWT(payload)
                        .setProtectedHeader({ alg: "HS256" })
                        .setIssuedAt()
                        .setExpirationTime("7d") // Match your session exp
                        .sign(secret);
                }
            }
        })
    ]
});
```

### 2. Backend Middleware (FastAPI)

> **Install:** `uv add "python-jose[cryptography]"`

```python
# backend/src/auth.py
import os
from typing import Optional
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

# MUST match the frontend .env
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        # Verify signature using the SHARED SECRET
        # This happens locally (CPU only), no network call needed.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Validate critical claims
        if not payload.get("sub"):
             raise HTTPException(status_code=401, detail="Token missing subject")

        return payload
    except JWTError as e:
        print(f"JWT Verification Failed: {e}") # Log for debug
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_current_user_id(payload: dict = Depends(verify_token)) -> str:
    return payload["sub"]
```

---

## Pattern B: JWKS (RS256) - **The "Best" Strategy (Production)**

**Why:** Decoupled security. Backend never knows the private key. Key rotation is automated via standard `.well-known/jwks.json` endpoint.
**Trade-off:** Backend must fetch keys from Frontend (Network dependency).

### 1. Frontend Configuration (Next.js)

Use the default! No hacks needed.

```typescript
// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";

export const auth = betterAuth({
    plugins: [
        jwt({
            jwt: {
                expirationTime: "1h", // Recommended shorter for RS256
            }
        })
    ]
});
```

### 2. Backend Middleware (FastAPI)

We need a JWKS client to fetch and cache the public keys.

> **Install:** `uv add "python-jose[cryptography]" httpx`

```python
# backend/src/auth.py
import os
import httpx
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

# Point to your Next.js internal URL (e.g., http://frontend:3000 in Docker)
JWKS_URL = os.getenv("AUTH_JWKS_URL", "http://localhost:3000/api/auth/jwks")

# Simple in-memory cache for keys
_jwks_cache = {}

async def get_jwks():
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(JWKS_URL)
            resp.raise_for_status()
            _jwks_cache = resp.json()
            return _jwks_cache
        except Exception as e:
            print(f"Failed to fetch JWKS: {e}")
            raise HTTPException(status_code=500, detail="Auth Server Unavailable")

async def verify_token_jwks(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    jwks = await get_jwks()

    try:
        # python-jose automatically finds the right key from JWKS based on 'kid' header
        payload = jwt.decode(token, jwks, algorithms=["RS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```
