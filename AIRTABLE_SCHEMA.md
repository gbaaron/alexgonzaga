# Alex Gonzaga Official — Airtable Schema

## Base Name: `AlexGonzaga`

Environment variables required:
- `AIRTABLE_API_KEY` — Personal access token
- `AIRTABLE_BASE_ID` — Base ID (starts with `app`)
- `JWT_SECRET` — Secret for signing auth tokens

---

## Table 1: Users
Fan accounts and membership info.

| Field | Type | Notes |
|-------|------|-------|
| Name | Single line text | Display name |
| Email | Email | Unique, used for login |
| Username | Single line text | Unique handle (e.g. @alexfan123) |
| PasswordHash | Single line text | bcrypt hash |
| Avatar | URL | Profile picture URL |
| Bio | Long text | Fan bio / about me |
| MembershipTier | Single select | `Free`, `Bestie`, `VIP`, `Inner Circle` |
| MembershipExpiry | Date | When current membership expires |
| JoinDate | Date | Account creation date |
| IsAdmin | Checkbox | Admin access flag |

---

## Table 2: Vlogs
YouTube content archive — organized better than YouTube.

| Field | Type | Notes |
|-------|------|-------|
| Title | Single line text | Video title |
| YouTubeID | Single line text | YouTube video ID for embeds |
| YouTubeURL | URL | Full YouTube link |
| Thumbnail | URL | Thumbnail image URL |
| Description | Long text | Video description |
| Category | Single select | `Comedy`, `Challenges`, `Family`, `Travel`, `Mukbang`, `Behind-the-Scenes`, `Pranks`, `Q&A`, `Collabs`, `GRWM`, `Storytime` |
| Mood | Multiple select | `Funny`, `Emotional`, `Chaotic`, `Wholesome`, `Savage`, `Kilig`, `Inspirational` |
| PublishDate | Date | Original publish date |
| Duration | Single line text | e.g. "12:34" |
| ViewCount | Number | For sorting by popularity |
| Featured | Checkbox | Show on homepage |
| Tags | Single line text | Comma-separated searchable tags |
| Season | Single line text | Optional grouping (e.g. "2024 Vlogs") |

---

## Table 3: MerchProducts
Merch store with limited drops tied to viral moments.

| Field | Type | Notes |
|-------|------|-------|
| Name | Single line text | Product name |
| Slug | Single line text | URL-friendly name |
| Description | Long text | Product description |
| Price | Currency (PHP) | Price in Philippine Peso |
| Images | Multiple URLs (JSON) | Product image URLs |
| Category | Single select | `Apparel`, `Accessories`, `Home & Lifestyle`, `Limited Edition`, `Stickers & Fun` |
| Sizes | Multiple select | `XS`, `S`, `M`, `L`, `XL`, `XXL`, `One Size` |
| Stock | Number | Available quantity |
| IsLimitedDrop | Checkbox | Part of a limited release |
| DropName | Single line text | Name of the drop collection |
| DropDate | Date | When the drop goes live |
| DropEndDate | Date | When the drop ends |
| CatchphraseOrigin | Single line text | Which viral moment inspired this |
| Status | Single select | `Active`, `Sold Out`, `Coming Soon`, `Archived` |
| SortOrder | Number | Display ordering |

---

## Table 4: Orders
Merch order tracking.

| Field | Type | Notes |
|-------|------|-------|
| OrderNumber | Single line text | Auto-generated (AG-XXXXX) |
| User | Link to Users | Who placed the order |
| Items | Long text | JSON array of items, sizes, quantities |
| TotalAmount | Currency (PHP) | Order total |
| Status | Single select | `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled` |
| ShippingAddress | Long text | Full shipping address |
| ContactNumber | Single line text | PH mobile number |
| PaymentMethod | Single select | `GCash`, `Maya`, `Bank Transfer`, `COD` |
| OrderDate | Date | When order was placed |
| TrackingNumber | Single line text | Shipping tracking |
| Notes | Long text | Special instructions |

---

## Table 5: CommunityPosts
Fan community hub — posts, fan art, memes, stories.

| Field | Type | Notes |
|-------|------|-------|
| UserID | Link to Users | Post author |
| Username | Lookup (from Users) | For display |
| Content | Long text | Post body text |
| Image | URL | Attached image URL |
| Type | Single select | `Post`, `Fan Art`, `Meme`, `Story`, `Question`, `Edit` |
| Likes | Number | Like count (default 0) |
| LikedBy | Long text | JSON array of user IDs |
| CreatedAt | Date | Post timestamp |
| Status | Single select | `Approved`, `Pending`, `Flagged` |
| Featured | Checkbox | Highlighted by admin |
| PinnedBy | Single line text | "admin" if pinned |

---

## Table 6: ExclusiveContent
Membership-gated content — BTS, uncut, early access.

| Field | Type | Notes |
|-------|------|-------|
| Title | Single line text | Content title |
| Description | Long text | What this content is about |
| Type | Single select | `Behind-the-Scenes`, `Uncut Moments`, `Early Access`, `Personal Message`, `Photo Set`, `Live Replay`, `Voice Message` |
| MediaURL | URL | Video/audio/image URL |
| Thumbnail | URL | Preview thumbnail |
| MinTier | Single select | `Bestie`, `VIP`, `Inner Circle` |
| PublishDate | Date | When published |
| Status | Single select | `Published`, `Draft`, `Scheduled` |
| Duration | Single line text | For video/audio content |
| SortOrder | Number | Display ordering |

---

## Table 7: ReactSubmissions
Fan submissions for "Alex Reacts" video series.

| Field | Type | Notes |
|-------|------|-------|
| UserID | Link to Users | Who submitted |
| Username | Lookup (from Users) | For display |
| Title | Single line text | Submission title |
| ContentURL | URL | Link to the content (YouTube, TikTok, etc.) |
| Description | Long text | Why Alex should react to this |
| Category | Single select | `Funny Video`, `Meme`, `TikTok`, `Fan Creation`, `Challenge`, `Throwback`, `Cringe` |
| Status | Single select | `Submitted`, `Under Review`, `Shortlisted`, `Selected`, `Used in Video`, `Rejected` |
| SubmittedAt | Date | Submission timestamp |
| Upvotes | Number | Community upvote count (default 0) |
| UpvotedBy | Long text | JSON array of user IDs |
| UsedInVideoURL | URL | Link to the video where Alex reacted |
| AdminNotes | Long text | Internal review notes |

---

## Table 8: Memberships
Subscription/membership tracking.

| Field | Type | Notes |
|-------|------|-------|
| UserID | Link to Users | Member |
| Tier | Single select | `Bestie`, `VIP`, `Inner Circle` |
| StartDate | Date | Membership start |
| EndDate | Date | Membership expiry |
| Status | Single select | `Active`, `Expired`, `Cancelled` |
| PaymentReference | Single line text | GCash/Maya reference number |
| Amount | Currency (PHP) | Payment amount |
| AutoRenew | Checkbox | Auto-renewal preference |

---

## Membership Tiers

| Tier | Price (PHP/mo) | Perks |
|------|---------------|-------|
| **Free** | 0 | Community access, vlog archive, react submissions |
| **Bestie** | 149 | + Behind-the-scenes content, exclusive posts, member badge |
| **VIP** | 349 | + Uncut moments, early vlog access, priority react submissions |
| **Inner Circle** | 799 | + Personal messages from Alex, live replay access, merch discounts, exclusive drops early access |

---

## Views to Create in Airtable

### Vlogs
- "All Published" — sorted by PublishDate desc
- "Featured" — filter Featured = true
- "By Category" — grouped by Category
- "By Mood" — grouped by Mood

### MerchProducts
- "Active Products" — filter Status = Active
- "Limited Drops" — filter IsLimitedDrop = true
- "Coming Soon" — filter Status = Coming Soon

### CommunityPosts
- "Approved" — filter Status = Approved, sorted by CreatedAt desc
- "Pending Review" — filter Status = Pending
- "Featured" — filter Featured = true

### ReactSubmissions
- "New Submissions" — filter Status = Submitted, sorted by SubmittedAt desc
- "Top Voted" — filter Status != Rejected, sorted by Upvotes desc
- "Selected" — filter Status = Selected or Used in Video

### ExclusiveContent
- "Published" — filter Status = Published, sorted by PublishDate desc
- "By Tier" — grouped by MinTier
