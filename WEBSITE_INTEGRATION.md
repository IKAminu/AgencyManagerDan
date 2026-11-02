# Website lead capture plan

The existing public application form must keep FormSubmit email delivery and passport attachments until a replacement is deliberately tested.

Add a secure server-side endpoint that validates and rate-limits a parallel CRM submission. Give every website submission a stable idempotency key so retries cannot create duplicate leads. The endpoint should create the lead and return a clear result without exposing privileged credentials.

The website should report email and database failures independently. A failure in one channel must not silently imply the other succeeded. Passport files should continue through the existing attachment path; do not send sensitive file contents into advertising systems.

Preserve the existing Meta Pixel `Lead` meaning. Capture optional source URL, campaign/ad identifiers, `fbc`, `fbp`, and original submission time. This endpoint, abuse protection, duplicate policy and production monitoring are not yet configured.
