# Google Sheets Template Structure

This document describes the structure of the Google Sheets that ProspectPulse will sync to.

## Sheet Setup

Create a Google Sheet with three sheets named exactly:
1. `Prospects`
2. `PreTalks`
3. `ActivityLogs`

## Sheet 1: Prospects

### Headers (Row 1)
| ID | Name | Phone | Email | Age | City | Profession | Source | Status | Assigned Mentor | Created By | Created At | Updated At |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| uuid | text | text | text | number | text | text | text | text | text | text | datetime | datetime |

### Example Row
| abc-123 | John Doe | +1234567890 | john@example.com | 30 | New York | Engineer | referral | new | Jane Mentor | Admin User | 2024-01-15T10:00:00Z | 2024-01-15T10:00:00Z |

## Sheet 2: PreTalks

### Headers (Row 1)
| ID | Prospect ID | Prospect Name | Mentor ID | Mentor Name | Scheduled At | Status | Meet Link | Notes | Created At | Updated At |
|---|---|---|---|---|---|---|---|---|---|---|
| uuid | uuid | text | uuid | text | datetime | text | url | text | datetime | datetime |

### Example Row
| def-456 | abc-123 | John Doe | mentor-789 | Jane Mentor | 2024-01-20T14:00:00Z | scheduled | https://meet.google.com/xxx-yyyy-zzz | Pre-talk notes here | 2024-01-15T11:00:00Z | 2024-01-15T11:00:00Z |

## Sheet 3: ActivityLogs

### Headers (Row 1)
| ID | User ID | User Name | Prospect ID | Prospect Name | Action | Meta | Created At |
|---|---|---|---|---|---|---|---|
| uuid | uuid | text | uuid | text | text | json | datetime |

### Example Row
| log-123 | user-456 | Admin User | abc-123 | John Doe | prospect_created | {"prospect_name":"John Doe"} | 2024-01-15T10:00:00Z |

## Setup Instructions

1. Create a new Google Sheet
2. Rename the default sheet to `Prospects`
3. Add the headers in Row 1 (as shown above)
4. Create two more sheets: `PreTalks` and `ActivityLogs`
5. Add headers to each sheet
6. Share the sheet with your Google account (the one used for OAuth)
7. Copy the Sheet ID from the URL and add it to `GOOGLE_SHEETS_ID` in your `.env`

## Notes

- Headers must be in Row 1
- Sheet names are case-sensitive
- The sync process will clear and rewrite data, so don't manually edit synced rows
- Keep a backup if you need to preserve manual edits

