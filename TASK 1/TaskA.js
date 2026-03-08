// The London Zoo
// Digital Platform — Task 1A Design Proposal

// Introduction
// This document outlines the analysis and design of a digital platform intended to support visitor navigation, information access and operational data management within the London Zoo. The document examines the business context, research into relevant technologies, and the functional and non-functional requirements of the system. It then presents the system architecture, interface design, algorithms and testing strategy used to ensure the solution is reliable, secure and accessible.

// 1. Business Context
// The London Zoo is a large public attraction that receives high volumes of visitors, including families, schools and tourists. Due to the magnitude of the zoo and the high volumes of visitors it receives, the organisation faces difficulties managing visitor movements and delivering timely information. The London Zoo receives a range of visitors varying in needs and expectations across all different age groups, including accessibility requirements and different levels of familiarity with the attraction. Digital systems play an important role in supporting visitor engagement, communication and operational coordination within such environments.

// 2. Industry Research & Emerging Technologies
// 2.1 Hardware and Software in the Industry
// • Wheelchairs & Mobility Scooters: Limited numbers are available for hire (pre-booking recommended) for those with mobility issues.
// • Fire Detection: EMS Fire Cell systems with over 130 wireless devices protect buildings and animals.
// • Charging: They offer "FUYL" smart lockers in the gift shop for secure charging of phones and laptops.
// 2.2 Emerging Technologies
// • Wildlife Monitoring: Develops and deploys SMART (Spatial Monitoring and Reporting Tool) software and low-cost tracking devices for field conservation.
// • Data Processing: Employs high-performance storage (like Solidigm drives) to handle massive datasets for faster analysis.
// • Mobile App: A GPS-enabled app helps visitors navigate, plan their day, and stay updated on talks and events.
// 2.3 Meeting Different User Needs
// • On-Site Assistance: Staff can be identified in green uniforms, and volunteers in red.
// • Assistance Animals: Contact the Supporter Contact team to arrange access for assistance animals.
// • Animal Adventures: Specific zones like "Animal Adventure" are designed for children.
// 2.4 Guidelines & Regulations

// UK GDPR: The UK General Data Protection Regulation governs the collection, storage and processing of personal data. Within the context of a digital platform for a public attraction such as London Zoo, this regulation is particularly relevant as the system collects personal data including email addresses, location data and behavioural interaction data. The system ensures data is collected only for its stated purpose and supports the right to erasure through ON DELETE CASCADE in the database schema.

// Cookie Regulations: The UK's Cookie Regulations require that the need for data collection must be clear and transparent, and that websites must inform users when tracking technologies are used, clearly outlining the use and purpose of said data. Within the context of the digital platform for London Zoo, this regulation is particularly relevant as the system implements express-session cookies to manage session activity. These cookies contain properties such as SameSite=Lax, which prevents cookies from being sent on cross-site subrequests but allows them during safe user-initiated navigations such as clicking a link from an external site. Users are informed of cookie usage upon first accessing the platform, ensuring compliance with the requirement for informed consent before tracking technologies are applied.

// WCAG 2.1: The Web Content Accessibility Guidelines (WCAG) 2.1 is a W3C standard that enhances accessibility for people with disabilities, including those with visual, motor, hearing and cognitive impairments. Within the context of the digital platform for London Zoo, this is particularly relevant as the zoo receives a diverse range of visitors including families, elderly visitors and users with accessibility needs. The system addresses this through NFR 1, which mandates compliance with WCAG 2.1 Level AA, requiring a minimum contrast ratio of 4.5:1 and resizable text up to 200% without loss of functionality. The interface design further supports this by implementing consistent navigation structures across all pages, clear and informative error messages delivered within 1 second, and a simple layout ensuring all users can interact with the platform effectively regardless of ability.

// Health and Safety at Work Act 1974: The Health and Safety at Work etc. Act 1974 (HSWA) is the primary legislation for workplace health and safety in Great Britain, placing a legal duty on employers to ensure, so far as is reasonably practicable, the health, safety and welfare of both employees and the public. Within the context of the digital platform for London Zoo, this act is particularly relevant as the zoo is a large public attraction where visitor safety and staff operational efficiency are critical concerns. The system supports visitor safety through real-time queue monitoring which reduces dangerous overcrowding at popular attractions, and GPS-based navigation which reduces the risk of visitors entering restricted or hazardous areas. Staff safety and operational efficiency is further supported through the staff dashboard, which provides real-time operational data enabling faster response to incidents, and role-based access control ensuring staff only access data relevant to their responsibilities, reducing the risk of operational errors.

// 3. Proposed Solution
// The proposed solution is a hybrid platform designed to support both visitors and staff, before, during and after their visit to the London Zoo. The platform will provide access to key information, support self-guided park navigation, and deliver digital services that enhance the visitor experience. The platform is designed to aid staff in data management through user metrics and provide communication across the zoo. The proposed solution is designed to be accessible across multiple digital devices ranging from smart phones to tablets and laptops.

// 4. Functional Requirements

// FR1 — Visitor: The system shall deliver real-time queue alert notifications to registered visitors when the estimated wait time at a selected attraction exceeds their configured alert threshold, so that visitors can make informed decisions about which attractions to visit. This is delivered by the Queue Alert algorithm querying the queue_status and user_preferences tables.

// FR2 — Visitor: The system shall provide personalised attraction suggestions to registered visitors by recording category interactions, incrementing a preference count per category, and querying the attractions table to identify similar attractions within the same category once a predetermined interaction threshold is surpassed, so that visitors receive curated recommendations relevant to their demonstrated interests. This is delivered by the Personalised Suggestions algorithm reading and updating the user_preferences table.

// FR3 — Visitors and Staff: The system shall provide real-time route and ETA information to all users by calculating a route and estimated travel time from the user's current GPS location to a selected attraction destination, querying the attractions table for coordinates, so that users can navigate the zoo independently without staff assistance. This is delivered by the Navigation Route and ETA algorithm reading the attractions table.

// FR4 — Staff: The system shall allow authorised staff members to access and filter attraction performance metrics by querying the users table to verify role = 'staff', querying the attractions table to validate the selected attraction filter, and querying the staff_metrics table filtered by attraction and date range, so that staff can analyse ticket sales, visitor counts and uptime data through the analytics dashboard. This is delivered by the Staff Data Filtering and Analytics Display algorithm.

// 5. Non-Functional Requirements

// NFR 1 — Accessibility: The system shall be accessible to users with motor, visual and hearing impairments in compliance with WCAG 2.1 Level AA guidelines, providing a minimum contrast ratio of 4.5:1 and resizable text up to 200% without loss of functionality.

// NFR 2 — Security: The system shall protect user data through HTTPS/TLS encryption for all data transmissions. Passwords shall be hashed using bcrypt before storage. Authentication tokens shall expire after 24 hours of inactivity.

// NFR 3 — Input Handling: The system shall be responsive to invalid or unexpected user input in a clear and consistent manner within 1 second without exposing system internals or crashing.

// NFR 4 — Performance: The system shall be resilient in handling navigation and queue requests within 2 seconds under a load of up to 500 concurrent users during peak visit periods.

// 6. System Decomposition
// The proposed system can be decomposed into several key components, including user account management, visitor information management, navigation and mapping, queue and attraction monitoring, communication and notifications, and data management and analytics. Each component is responsible for a specific area of functionality and can be developed and maintained independently as part of the overall system.

// Core components such as user account management and data storage would be developed first, as they provide the foundation for authentication, personalisation, and secure access to system data. Navigation and location services, along with queue and attraction information modules, would be built next, as these rely on access to stored data and user context. The notification and alert system would then be integrated to react to changes in queue data and user preferences. Finally, the staff data management and analytics module would be developed to allow authorised staff to analyse stored performance data, building on all previously established data sources.

// [System Decomposition Diagram — Insert exported Draw.io PNG here]

// 7. KPIs & User Acceptance Criteria
// 7.1 KPIs

// Registration Completion Rate: At least 70% of users who begin the registration process should successfully complete it within one hour of starting, measured over the first 3 months post-launch.
// Queue Monitoring Engagement Rate: At least 60% of registered users should actively monitor queue updates on any given day, measured over the first year post-launch.
// Navigation System Usage Rate: At least 80% of logged-in users should use the navigation system at least once per day, measured over the first month post-launch.
// Login Success Rate: At least 90% of registered account login attempts should be successful, measured over a 12-month period post-launch.
// 7.2 User Acceptance Criteria

// UAC 1 — Queue Notifications: Given a registered visitor has notifications enabled in their preferences, when the estimated wait time at a selected attraction exceeds their configured alert threshold, then the system shall display a real-time push notification to the user within the platform. Pass: Notification is received and displayed with the correct attraction name and estimated wait time. Fail: No notification is delivered, or notification contains incorrect attraction data.

// UAC 2 — Personalised Suggestions: Given a registered user has interacted with an attraction per category, when the predetermined threshold is exceeded, the user's preferences will be dynamically altered to display similar content. Pass: User preferences dynamically alter once attractions of a particular category have been interacted with beyond the set threshold. Fail: The user's preferences do not change and remain static regardless of user interaction.

// UAC 3 — Navigation and ETA Route: Given a user registered or unregistered is on the navigation page and has granted location permission access, when the user selects a valid destination, the system calculates and displays the route and ETA to the selected destination. Pass: User can appropriately navigate to a selected destination with ease without assistance using the displayed route and ETA. Fail: No route is displayed or the incorrect destination is shown.

// UAC 4 — Staff Data Filtering: Given a user is a registered authorised staff member, when the user selects an attraction and a date range filter, the system will display analytic panels relevant to the selected attraction and filters. Pass: Correctly filtered data is displayed for the relevant attraction within the selected date range. Fail: Unauthorised access granted, incorrect data shown, or no results returned despite valid filters.

// 8. Justification
// 8.1 Solution Rationale
// A GPS-based navigation system was chosen over static printed maps and fixed signage because it provides real-time positioning and dynamic route calculation, enabling visitors to navigate independently regardless of their entry point or current location within the zoo. This directly reduces visitor reliance on staff for wayfinding, supporting London Zoo's operational efficiency. This is implemented through the Navigation Route and ETA algorithm which queries the attractions table for GPS coordinates stored as DECIMAL(10,8) and DECIMAL(11,8) to calculate precise routes and estimated travel times.

// The implementation of a hybrid platform was chosen over a native application to eliminate platform dependency, allowing both visitors and staff to access the system across iOS, Android and desktop browsers without requiring separate development for each platform. This ensures maximum accessibility regardless of device, directly supporting the WCAG 2.1 Level AA compliance requirement defined in NFR 1.

// The implementation of real-time push notifications was chosen over email-based alerts because push notifications deliver time-sensitive information instantly without requiring users to actively check an external inbox, ensuring visitors receive queue and attraction updates at the moment they are most actionable. Notification preferences are managed through the notifications_enabled and distance_alert_threshold fields in the user_preferences table, with alerts automatically triggered by the Queue Alert algorithm when estimated wait time exceeds the user's configured threshold.

// The implementation of personalised suggestions over manual user selection was chosen because manual selection requires active input from the visitor and cannot adapt to evolving interests, whereas the automated system dynamically updates attraction recommendations based on recorded category interactions surpassing a predetermined threshold, ensuring suggestions remain relevant throughout the visitor's time at the zoo. This is delivered through the Personalised Suggestions algorithm which reads and updates the preferred_attractions field in the user_preferences table, as defined in FR2.

// 8.2 Risks & Mitigations
// The proposed system handles a range of personal visitor and staff data, making risk awareness a critical consideration throughout the design process. Risks have been assessed across seven categories including data breaches, SQL injection, XSS, man-in-the-middle attacks, malicious input, inaccurate queue data and system downtime, with each assigned a likelihood and impact rating alongside a specific technical mitigation. Full risk documentation including mitigations is provided in the risk tables below.

// Field	Content
// Risk	Inaccurate real-time information delivery affecting operational coordination which could impact visitor experience and staff decision-making.
// Likelihood	Medium — queue data accuracy depends on consistent staff updates and stable data connections, both of which are subject to variation.
// Impact	Medium — inaccurate queue information frustrates visitors and reduces trust in the platform, but does not constitute a security or data breach.
// Mitigation	The queue_status table records a last_updated timestamp on every write, enabling the system to detect stale data. The system notifies users when data exceeds a freshness threshold rather than displaying potentially inaccurate information.

// Field	Content
// Risk	System downtime affecting staff communication and user data management, which may result in increased manual workload and reduced service quality.
// Likelihood	Low — modern cloud hosting infrastructure is highly reliable, and the system's graceful degradation mechanisms reduce the probability of total failure.
// Impact	Medium — staff dashboard access and live queue monitoring are temporarily lost, increasing manual workload and reducing real-time visitor guidance.
// Mitigation	The system implements graceful degradation by displaying a static map when live data is unavailable, and informative error messages across all features ensure users are informed rather than left without feedback.

// Field	Content
// Risk	Unauthorised access to confidential visitor data through interception or credential theft could result in a data breach affecting platform trust.
// Likelihood	Medium — data breaches are a realistic threat for any platform handling personal data, though HTTPS encryption and bcrypt hashing significantly reduce the probability.
// Impact	High — a successful breach could expose visitor credentials and personal data, resulting in identity theft, financial loss, reputational damage, and GDPR enforcement action.
// Mitigation	All data transmissions are encrypted using HTTPS/TLS to prevent interception. Passwords are stored as bcrypt hashes ensuring plaintext credentials are never retained. Authentication tokens expire after 24 hours limiting the window of unauthorised access.

// Field	Content
// Risk	SQL Injection attack via user input fields such as login forms or search inputs could allow an attacker to manipulate or destroy the database.
// Likelihood	Medium — SQL injection is one of the most common web attack vectors, though the risk is significantly reduced by parameterised queries and input validation.
// Impact	High — a successful SQL injection attack could expose, corrupt or delete the entire database, resulting in a serious data breach and GDPR enforcement action.
// Mitigation	All user inputs are sanitised and validated at the application layer before being passed to the database. Parameterised queries are used throughout to ensure user input is never executed as SQL.

// Field	Content
// Risk	Cross-Site Scripting (XSS) attack where malicious scripts are injected into the platform through user input fields and executed in other users browsers.
// Likelihood	Medium — XSS is a widely exploited vulnerability in web platforms that accept user input, though output encoding and Content Security Policy headers significantly reduce the risk.
// Impact	High — a successful XSS attack could allow an attacker to hijack visitor sessions, steal authentication tokens, and access personal account data, resulting in a GDPR breach.
// Mitigation	All user-generated content is HTML-encoded before being rendered in the browser to prevent script execution. Content Security Policy (CSP) headers restrict which scripts can execute on the platform.

// Field	Content
// Risk	Man-in-the-Middle (MitM) attack where an attacker intercepts communications between the user and server, reading or manipulating data in transit.
// Likelihood	Low — HTTPS/TLS encryption is enforced across all communications, making interception significantly more difficult even on unsecured public networks.
// Impact	High — a successful MitM attack could expose visitor login credentials and personal data in transit, resulting in identity theft and a GDPR breach.
// Mitigation	All data transmissions between the client and server are encrypted using HTTPS/TLS as defined in NFR 2, preventing interception in transit. Authentication tokens expire after 24 hours of inactivity, limiting the window of exposure.

// Field	Content
// Risk	Malicious or inappropriate user input submitted through platform input fields intended to disrupt system behaviour or inject harmful content.
// Likelihood	High — any publicly accessible platform with input fields is routinely subjected to malicious input attempts, particularly text fields and search inputs.
// Impact	Low — input validation and error handling prevent malicious input from affecting the database or other users. The primary impact is attempted disruption rather than data loss.
// Mitigation	All input fields enforce strict validation rules at the application layer, rejecting inputs that exceed defined length limits or contain invalid characters. The system returns a clear error message within 1 second as defined in NFR 3, without exposing system internals or crashing.

// 8.3 Regulatory Compliance and Legal Requirements
// The UK GDPR requires organisations to implement appropriate technical measures to ensure the security of personal data. The system addresses this through multiple layers of protection — all data transmissions are encrypted using HTTPS/TLS preventing interception in transit, passwords are stored exclusively as bcrypt hashes ensuring plaintext credentials are never retained, and authentication tokens expire after 24 hours of inactivity limiting the window of unauthorised access, as defined in NFR 2.

// The UK GDPR also requires organisations to implement appropriate measures to ensure data minimisation and the right to erasure. The system addresses this through multiple mechanisms within the database schema — all user-related data is automatically removed using ON DELETE CASCADE functionality when a user account is deleted, ensuring no residual personal data is retained beyond the user's relationship with the system. The edited_at field in the users table provides a continuous audit trail supporting GDPR accountability obligations. Additionally, data is collected solely to support stated system functionality such as navigation, queue monitoring and personalisation, ensuring no unnecessary personal data is gathered beyond what each feature requires.

// The organisation must comply with WCAG 2.1 Level AA guidelines to ensure the platform is accessible to users with visual, motor and hearing impairments. The system addresses this requirement through NFR 1, which mandates a minimum contrast ratio of 4.5:1, resizable text up to 200% without loss of functionality, and compatibility with assistive technologies such as screen readers. The interface design implements consistent navigation structures across all pages, ensuring users with cognitive or motor impairments can interact with the platform predictably and without confusion.
