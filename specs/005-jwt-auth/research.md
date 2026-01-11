# Research: Authentication Pattern Selection

**Feature**: 005-jwt-auth | **Date**: 2026-01-10

## Decision: Shared Secret Pattern A (HS256)

### Rationale

For Phase 2 of the Todo Web App, we choose **Pattern A: Shared Secret (HS256)** over Pattern B (JWKS/RS256) based on:

1. **Simplicity**: Single environment variable (`BETTER_AUTH_SECRET`) shared between services
2. **Performance**: Zero network overhead - verification is purely CPU-based (< 1ms)
3. **Hackathon Scope**: No need for key rotation or multi-tenant scenarios
4. **Alignment**: Matches constitution section IV (Better Auth + JWT with HS256)

### Alternatives Considered

| Pattern | Pros | Cons | Decision |
|---------|------|------|----------|
| **A: HS256 Shared Secret** | Simple, fast, no network calls | Manual key rotation | ✅ SELECTED |
| **B: RS256 JWKS** | Key rotation, industry standard | Network dependency, complexity | ❌ Rejected |
| **Session-only (no JWT)** | Simpler frontend | Backend needs session store | ❌ Rejected |

### Implementation Details

**Frontend (Better Auth)**:
- Override default `RS256` signing with custom `HS256` using `jose` library
- JWT plugin configured with 7-day expiry matching session duration

**Backend (FastAPI)**:
- Use `python-jose[cryptography]` for verification
- HTTPBearer security scheme extracts token from Authorization header
- Stateless verification - no database lookup required

### Security Considerations

- **Secret Length**: Minimum 32 characters as per SR-006
- **Token Storage**: HTTP-only cookies only (no localStorage)
- **CORS**: Restricted to frontend domain
- **Expiry**: 7 days with daily session refresh

### References

- [configuring-better-auth/references/fastapi-jwt-integration.md](../../../.claude/skills/configuring-better-auth/references/fastapi-jwt-integration.md)
- [Constitution Section IV](../../../.specify/memory/constitution.md#iv-authentication-better-auth--jwt)
