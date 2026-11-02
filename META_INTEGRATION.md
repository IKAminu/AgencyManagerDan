# Meta integration plan

Lead records are prepared to retain source platform, campaign/ad set/ad names and IDs, landing URL, `fbc`, `fbp`, and original submission time. Manual leads remain valid without these fields.

Future Conversions API events must be sent by a secure server-side function. Meta Business configuration, ad account, Pixel/Dataset ID and access token belong in server secrets, never frontend code. Candidate outcomes are qualified lead, converted lead and completed booking.

Do not send passport details, documents, payment values or unnecessary personal data. Review consent, Meta requirements and applicable privacy obligations before enabling events. No Meta account is connected and no event is currently sent.
