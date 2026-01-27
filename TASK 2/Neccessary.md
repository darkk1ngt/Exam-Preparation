# Task 2A: Revised Data & Database Schema
## London Zoo Digital Platform — Scope-Optimised

---

## Revised Relational Schema

#### **USER**
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| user_id | UUID | PRIMARY KEY | Task 1: User Account Data (ID) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Task 1: User Account Data (credentials) |
| password_hash | VARCHAR(255) | NOT NULL | Task 1: User Account Data (credentials) |
| user_type | ENUM('visitor', 'staff') | NOT NULL | Task 1: Visitor/Staff roles |
| created_at | TIMESTAMP | NOT NULL | System audit |
| last_login | TIMESTAMP | NULL | Personalisation tracking |

**Supports:** Task 1 — User Account Data (credentials, authentication).

---

#### **USER_PREFERENCE**
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| preference_id | UUID | PRIMARY KEY | Task 1: Personalisation |
| user_id | UUID | FOREIGN KEY (USER), UNIQUE | Links to user account |
| language | VARCHAR(10) | Default: 'en' | Task 1: Multi-language support |
| accessibility_needs | TEXT | NULL | Task 1: Optional accessibility preferences |
| favourite_attractions | JSON | NULL | Task 1: Personalisation |
| notification_settings | JSON | NULL | Task 1: Alert preferences |
| updated_at | TIMESTAMP | NOT NULL | Audit trail |

**Supports:** Task 1 — Personalisation/Preferences, optional accessibility preferences / multi-language support.

---

#### **ATTRACTION**
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| attraction_id | UUID | PRIMARY KEY | Task 1: Queue & Attraction Data |
| name | VARCHAR(255) | NOT NULL | Zone/attraction identity |
| attraction_type | VARCHAR(100) | NOT NULL | Category (ride, show, exhibit, facility) |
| location_x | DECIMAL(10, 6) | NOT NULL | Task 1: Navigation & Location Data |
| location_y | DECIMAL(10, 6) | NOT NULL | Task 1: Navigation & Location Data |
| max_capacity | INT | NOT NULL | Task 1: Queue time estimation baseline |
| current_queue_length | INT | Default: 0 | Task 1: Real-time queue monitoring |
| average_wait_minutes | INT | Default: 0 | Task 1: Estimated wait time output |
| status | ENUM('open', 'closed', 'delayed') | Default: 'open' | Task 1: Attraction status + closures/delays |
| last_status_update | TIMESTAMP | NOT NULL | Audit trail |

**Supports:** Task 1 — Queue & Attraction Data (max_capacity and current_queue_length enable wait time estimation; spatial coordinates for navigation).

---

#### **QUEUE_STATUS** *(Replaced QUEUE_RECORD: attraction-level only, no user tracking)*
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| queue_update_id | UUID | PRIMARY KEY | Task 1: Queue monitoring |
| attraction_id | UUID | FOREIGN KEY (ATTRACTION), NOT NULL | Attraction queue |
| timestamp | TIMESTAMP | NOT NULL, INDEX | Queue status snapshot time |
| current_queue_length | INT | NOT NULL | Real-time queue size |
| average_wait_minutes | INT | NOT NULL | Current estimated wait time |
| status | ENUM('open', 'closed', 'delayed') | NOT NULL | Attraction operational status |

**Supports:** Task 1 — Queue & Attraction Data (attraction-level queue times and status updates only; no individual user queue tracking).

---

#### **LOCATION_DATA** *(Simplified: current location only, no route storage)*
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| location_id | UUID | PRIMARY KEY | Task 1: Navigation & Location Data |
| user_id | UUID | FOREIGN KEY (USER), NOT NULL | Visitor/staff member |
| latitude | DECIMAL(10, 8) | NOT NULL | Task 1: Current location |
| longitude | DECIMAL(10, 8) | NOT NULL | Task 1: Current location |
| timestamp | TIMESTAMP | NOT NULL, INDEX | Real-time tracking |
| accuracy_meters | INT | NULL | Confidence metric |

**Supports:** Task 1 — Navigation & Location Data (current location tracking only; routes calculated client-side, not stored).

---

#### **NOTIFICATION_ALERT**
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| alert_id | UUID | PRIMARY KEY | Task 1: Notification & Alert Data |
| user_id | UUID | FOREIGN KEY (USER), NOT NULL | Recipient |
| attraction_id | UUID | FOREIGN KEY (ATTRACTION), NULL | Related attraction (if applicable) |
| alert_type | ENUM('queue_update', 'attraction_status', 'wait_time_threshold') | NOT NULL | Task 1: Alert triggers |
| message | TEXT | NOT NULL | Alert content |
| severity | ENUM('info', 'warning', 'critical') | Default: 'info' | Priority level |
| created_at | TIMESTAMP | NOT NULL, INDEX | Alert timestamp |
| is_read | BOOLEAN | Default: FALSE | Notification status |

**Supports:** Task 1 — Notification & Alert Data (alerts tied to queue/status updates, visitor + staff delivery).

---

#### **STAFF_PERFORMANCE** *(Reduced: ticket sales + attraction uptime only)*
| Column | Data Type | Constraints | Traceability |
|--------|-----------|-------------|--------------|
| performance_id | UUID | PRIMARY KEY | Task 1: Staff & Performance Data |
| staff_id | UUID | FOREIGN KEY (USER), NOT NULL | Staff member (user_type = 'staff') |
| attraction_id | UUID | FOREIGN KEY (ATTRACTION), NOT NULL | Assigned attraction |
| date | DATE | NOT NULL, INDEX | Performance date |
| tickets_sold | INT | Default: 0 | Task 1: Ticket sales data |
| attraction_uptime_percent | DECIMAL(5, 2) | Default: 100.0 | Task 1: Attraction performance/availability |
| recorded_at | TIMESTAMP | NOT NULL | Audit timestamp |

**Supports:** Task 1 — Staff & Performance Data (ticket sales tracking, attraction operational performance analytics).

---

## Data Relationships & Integrity

| Relationship | Type | Cardinality | Constraint | Justification |
|---|---|---|---|---|
| USER → USER_PREFERENCE | Has | 1:1 | ON DELETE CASCADE | Preferences tied to account |
| USER → LOCATION_DATA | Tracks | 1:M | ON DELETE CASCADE | Real-time location history |
| USER → NOTIFICATION_ALERT | Receives | 1:M | ON DELETE CASCADE | Alert delivery to visitor/staff |
| USER → STAFF_PERFORMANCE | Generates | 1:M (staff only) | ON DELETE CASCADE | Performance records for staff only |
| ATTRACTION → QUEUE_STATUS | Updates | 1:M | ON DELETE CASCADE | Multiple queue status snapshots per attraction |
| ATTRACTION → NOTIFICATION_ALERT | Triggers | 1:M | ON DELETE SET NULL | Alerts linked to attraction status changes |
| ATTRACTION → STAFF_PERFORMANCE | Monitored | 1:M | ON DELETE RESTRICT | Performance analytics per attraction |
| LOCATION_DATA.user_id → USER | References | M:1 | ON DELETE CASCADE | Visitor/staff location tracking |

---

## Traceability Matrix: Revised Schema ↔ Task 1 Requirements

| Task 1 Data Group | Implemented By | Purpose | Scope |
|---|---|---|---|
| **User Account Data** | USER, USER_PREFERENCE | Secure login + personalised experience | Credentials, language, accessibility, favourites |
| **Navigation & Location Data** | ATTRACTION (coordinates), LOCATION_DATA | Real-time location tracking + wayfinding | Current location only; routes calculated client-side |
| **Queue & Attraction Data** | ATTRACTION, QUEUE_STATUS | Attraction queue monitoring + status visibility | Attraction-level queue metrics and status updates only |
| **Notification & Alert Data** | NOTIFICATION_ALERT | Proactive alerts on queue/status changes | Visitor + staff alert delivery tied to attraction updates |
| **Staff & Performance Data** | STAFF_PERFORMANCE | Staff dashboard: ticket sales + attraction uptime | Ticket counts and operational availability only |

---

## Scope Changes Summary

| Element | Previous | Revised | Rationale |
|---|---|---|---|
| **Queue Tracking** | QUEUE_RECORD: per-user queue position, join/exit times, estimated wait | QUEUE_STATUS: attraction-level snapshots only | Task 1 requires queue *times* (ATTRACTION.average_wait_minutes) not individual user positions |
| **Location Data** | Stored route JSON + destination + ETA | Current location + accuracy only | Routes calculated client-side; Task 1 specifies "current location" as input, route/ETA as *output* not storage |
| **Staff Performance** | 9 fields: tickets, uptime, queue accuracy, incidents, notes | 2 Task 1-required fields: tickets_sold, attraction_uptime_percent | Task 1 specifies "ticket sales" and "attraction performance"; incidents/queue_accuracy not evidenced in Task 1 scope |

---

**Entity Count:** 7 core tables (USER, USER_PREFERENCE, ATTRACTION, QUEUE_STATUS, LOCATION_DATA, NOTIFICATION_ALERT, STAFF_PERFORMANCE)
**Data Model Type:** Relational (optimised for operational simplicity and minimal scope)
**Traceability:** All entities explicitly mapped to Task 1 data groups with scope boundaries defined
