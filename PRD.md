**==> picture [24 x 11] intentionally omitted <==**

**----- Start of picture text -----**<br>
RM<br>**----- End of picture text -----**<br>


## **RENTMATERENT** 

_Your Smart Home Awa From Home y_ 

Student Accommodation · Roommate Matching · PG Discovery 

## **PRODUCT REQUIREMENTS DOCUMENT** 

Version 2.0  ·  June 2026  ·  Final 

**PLATFORM** 

**PROGRAM** 

**TEAM** 

**STATUS** 

Web Application (MERN Stack) 

Gryork TechPreneur Training Program 

FantasticFour 

Final 

## **TEAM MEMBERS** 

**Priyanshu Singh** — Frontend Development & UI/UX **Alokit Mishra** — Backend Development 

**Sunny Kumar Gupta** — Database & API Development 

**Prakhar Pandey** — Project Coordination, Testing & Documentation 

Confidential  ·  Team FantasticFour  ·  Gryork TechPreneur Training Program 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

## **Table of Contents** 

**1.** Executive Summary **2.** Problem Statement **3.** Vision Statement **4.** Goals & Objectives **5.** User Personas **6.** User Stories **7.** System Overview **8.** Project Scope **9.** Core Features **10.** Functional Requirements **11.** Unique Selling Points (USP) **12.** System Modules **13.** User Flow **14.** Non-Functional Requirements **15.** Success Metrics **16.** Market Analysis **17.** Competitive Analysis **18.** Technical Architecture **19.** Database Design **20.** UI/UX Design Guidelines **21.** Assumptions & Constraints **22.** Future Roadmap **23.** Expected Outcome **—** API Endpoints 

Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 2 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

## **1. Executive Summary** 

RentMate is a student-centric accommodation discovery platform that helps students find verified PGs, hostels, shared apartments, and compatible roommates. The platform simplifies accommodation discovery through intelligent search, college-based recommendations, roommate compatibility analysis, interactive maps, and expense management. 

RentMate aims to build a trusted ecosystem where students can safely relocate to a new city without depending on brokers, social media groups, or unreliable referrals. 

## **2. Problem Statement** 

Students relocating to different cities for education face serious difficulties finding affordable, safe, and trustworthy accommodation. Current methods rely heavily on Facebook Groups, WhatsApp Communities, local brokers, and word-of-mouth referrals. 

|**Issue**|**Description**|
|---|---|
|Fake Listings|Fraudulent postings with misleading information|
|Hidden Charges|Undisclosed fees revealed only after commitment|
|Poor Roommate Matching|No structured way to find compatible housemates|
|Lack of Verification|No identity or property verification mechanisms|
|Unsafe Environments|No trust signals for evaluating safety|
|Time-Consuming Searches|Manual browsing across fragmented sources|



## **3. Vision Statement** 

To become the most trusted student accommodation ecosystem by simplifying housing discovery, roommate matching, and student relocation experiences. 

## **4. Goals & Objectives** 

## **4.1 Product Goals** 

|**Goal**|**Objective**|
|---|---|
|Simplify Accommodation Discovery|Help students find housing quickly|
|Improve Roommate Matching|Connect compatible students|
|Increase Transparency|Provide verified listings|
|Reduce Search Time|Minimise effort and time spent|
|Enhance Student Safety|Build trust through verification|
|Improve User Experience|Create a seamless platform|



## **4.2 Business Objectives** 

Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 3 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

- Build a scalable student housing marketplace 

- Increase verified property inventory 

- Improve user trust and engagement 

- Enable sustainable platform growth 

## **5. User Personas** 

The platform is designed around three primary user types. Each role has distinct needs, pain points, and responsibilities. 

|**Persona**|**Needs**|**Pain Points**|wn roommates,<br>dent market<br>ity control|
|---|---|---|---|
|Student|Affordable accommodation near college, safe<br>environment, compatible roommates, verified listin|gs<br>Fake listings, hidden costs, unkno<br>time-consuming searches||
|Property Owner|Better visibility, more inquiries, higher occupancy|Vacant rooms, limited reach to stu||
|Admin|Fraud prevention, listing moderation, user<br>management, platform analytics|Scalable verification, content qual||



## **6. User Stories** 

|**ID**|**User Story**|
|---|---|
|US-1|As a student, I want to search accommodation near my college so I can find housing quickly.|
|US-2|As a student, I want verified listings so I can avoid scams.|
|US-3|As a student, I want roommate recommendations so I can find compatible housemates.|
|US-4|As a student, I want to save properties for later comparison.|
|US-5|As a student, I want to manage shared expenses with roommates.|
|US-6|As a property owner, I want to publish listings so students can discover my property.|
|US-7|As an admin, I want to verify listings to prevent fraudulent content.|



## **7. System Overview** 

RentMate serves three major stakeholders with distinct capabilities: 

|**Capability**|**Student**|**Property Owner**|**Admin**|
|---|---|---|---|
|**Register / Login**|Yes|Yes|Yes|
|**Search Accommodation**|Yes|—|—|
|**View Property Details**|Yes|—|—|
|**Save Favourite Properties**|Yes|—|—|
|**Find & Match Roommates**|Yes|—|—|
|**Manage Shared Expenses**|Yes|—|—|
|**Contact Property Owner**|Yes|—|—|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 4 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

|**Create / Edit / Delete Listings**|—|Yes|—|
|---|---|---|---|
|**View Student Inquiries**|—|Yes|—|
|**Verify Listings**|—|—|Yes|
|**Manage Users**|—|—|Yes|
|**Remove Fraudulent Content**|—|—|Yes|
|**View Analytics Dashboard**|—|Yes|Yes|



## **8. Project Scope** 

The scope of RentMate defines the features and functionalities included in the MVP while clearly identifying features intentionally excluded from the current release. 

## **8.1 In Scope** 

|**Module**|**Included Features**|ification<br>tus<br>ces<br>ation|
|---|---|---|
|User Management|Student & owner registration/login, profile management, email & phone ver||
|Accommodation Discovery|Search by city, locality, college name; property detail pages; availability sta||
|Advanced Filtering|Budget, type, occupancy, amenities, distance from college||
|Property Listing Mgmt|Create, edit, delete listings; image upload; vacancy management||
|Roommate Matching|Profile creation, lifestyle preferences, compatibility score, discovery||
|Verification System|Student & property verification, verified badge, admin approval workflow||
|Wishlist & Favorites|Save properties & roommate profiles; view saved items||
|Expense Splitter|Add/categorise shared expenses, calculate shares, view outstanding balan||
|Reviews & Ratings|Property ratings, review submission & display (verified students only)||
|Notifications|Vacancy alerts, new listings, price drops, roommate match notifications||
|Administration Panel|User management, listing verification, analytics dashboard, content moder||



## **8.2 Explicit Non-Goals** 

To keep the MVP focused and deliverable, the following are intentionally excluded from scope: 

|**Category**|**Excluded Items**|
|---|---|
|Online Payments|Rent gateway, UPI integration, security deposit collection|
|Legal Documentation|Digital rental agreements, e-signatures, lease generation|
|Advanced AI|AI chatbot, fraud detection, recommendation engine|
|Communication|Voice/video calling, group messaging|
|Mobile Applications|Native Android & iOS apps|
|Social Features|Community forums, student feed, event management|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 5 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

## **9. Core Features** 

## **A. Smart Accommodation Search** 

Students can search properties using city, area, college name, budget, property type, and sharing type. 

## **B. Verified Property Listings** 

Each listing includes owner details, rent, deposit, distance from college, amenities (WiFi, AC, laundry, mess, CCTV, gym, parking, power backup), and property/room images. 

## **C. Smart Roommate Matching** 

Students build roommate profiles covering sleep schedule, study hours, food preference, smoking preference, cleanliness level, introvert/extrovert tendency, and noise tolerance. The system generates a compatibility score with explanatory reasons. 

## **Example Output** 

```
Compatibility Score: 92%
Reasons: Similar sleeping schedule  •  Similar study habits  •  Same food preference
```

## **D. Interactive Maps** 

Maps display PG location, college, nearby hospitals, grocery stores, bus stops, cafes, and ATMs via Google Maps API. 

## **E. Expense Splitter** 

Supports categories: Rent, Electricity, Water, Internet, Groceries. Calculates per-person shares and shows outstanding balances between roommates. 

## **F. Verification System** 

|**Verification Type**|**Method**|
|---|---|
|Student Verification|College ID, Email, Phone|
|Property Verification|Owner badge, Admin approval workflow|



## **G. Notification System** 

Triggers: New property added, price drop, vacancy available, roommate request accepted. 

## **H. Review & Rating System** 

Students rate properties on food quality, safety, internet connectivity, and cleanliness. Only verified students may submit reviews. 

## **10. Functional Requirements** 

## **10.1 Student Features** 

|**ID**|**Requirement**|
|---|---|
|FR-1|User Registration|
|FR-2|Login Authentication|
|FR-3|Search Accommodation|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 6 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

|FR-4|Budget Filter|
|---|---|
|FR-5|Location Filter|
|FR-6|College-Based Search|
|FR-7|Property Details View|
|FR-8|Save Favourite Properties|
|FR-9|Contact Property Owner|
|FR-10|Roommate Discovery|
|FR-11|Compatibility Score|
|FR-12|Expense Splitter|
|FR-13|Profile Management|



## **10.2 Property Owner Features** 

|**ID**|**Requirement**|
|---|---|
|FR-14|Create Listing|
|FR-15|Edit Listing|
|FR-16|Delete Listing|
|FR-17|Manage Availability|
|FR-18|View Student Inquiries|



## **10.3 Admin Features** 

|**ID**|**Requirement**|
|---|---|
|FR-19|Verify Listings|
|FR-20|Manage Users|
|FR-21|Remove Fraudulent Content|
|FR-22|Analytics Dashboard|



## **11. Unique Selling Points (USP)** 

|**#**|**USP**|**Description**|
|---|---|---|
|1|Student-First Design|Built exclusively for the student accommodation use case|
|2|Smart Roommate Matching|Compatibility scoring based on lifestyle preferences|
|3|College-Based Search|Find PGs directly linked to a specific college|
|4|Verified Ecosystem|Trust signals via verified owner & student badges|
|5|Expense Management|Built-in splitter for shared monthly expenses|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 7 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

6 Interactive Maps Live neighbourhood context around every property 

## **12. System Modules** 

|**Module**|**Pages / Components**|ions|
|---|---|---|
|Public Pages|Home, About, Contact, Property Listings||
|Student Module|Register, Login, Dashboard, Profile, Saved Properties, Expenses, Notificat||
|Property Owner Module|Add Property, Manage Properties, Analytics||
|Admin Module|Dashboard, User Management, Listing Verification||



## **13. User Flow** 

The student journey through the platform follows a clear sequential flow: 

|**Step**|**Action**|**Description**|
|---|---|---|
|1|Register|Create student account and verify identity|
|2|Complete Profile|Add college, preferences, and roommate criteria|
|3|Select College|Anchor search to a specific institution|
|4|Search PG|Browse verified listings in the area|
|5|Apply Filters|Narrow by budget, type, occupancy, amenities|
|6|View Property|Review full details, images, map, and reviews|
|7|Save Property|Add to wishlist for later comparison|
|8|Find Roommate|Discover compatible students seeking accommodation|
|9|Check Compatibility|Review compatibility score and lifestyle alignment|
|10|Contact Owner|Send inquiry directly to the property owner|
|11|Move In|Complete the offline agreement and relocate|



## **14. Non-Functional Requirements** 

|**Category**|**Requirement**|
|---|---|
|Performance|Search results returned in under 2 seconds|
|Availability|99% uptime SLA|
|Scalability|Support 1,000+ concurrent users|
|Security|JWT authentication and secure REST APIs|
|Reliability|Accurate and consistent data across sessions|
|Compatibility|Mobile, tablet, and desktop browser support|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 8 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

Maintainability Modular and scalable MERN architecture 

## **15. Success Metrics** 

|**Category**|**Metric**|**Target**|
|---|---|---|
|User|Registered Students|Growth Month-over-Month|
|User|Daily Active Users (DAU)|Tracked|
|User|Monthly Active Users (MAU)|Tracked|
|User|User Retention Rate|Tracked|
|Marketplace|Number of Verified Listings|Growing inventory|
|Marketplace|Inquiry-to-Conversion Rate|Tracked|
|Product|Search Response Time|< 2 seconds|
|Product|Profile Completion Rate|> 80%|
|Product|Roommate Match Success Rate|Tracked|
|Satisfaction|Average User Rating|> 4 / 5|
|Satisfaction|Positive Feedback Rate|> 80%|



## **16. Market Analysis** 

|**Audience Type**|**Segment**|dents|
|---|---|---|
|Primary|Undergraduate Students, Postgraduate Students, International Students, Internship Stu||
|Secondary|PG Owners, Hostel Owners, Property Managers||



The student accommodation market continues to grow due to increasing student migration across cities for higher education and internships. Existing solutions lack student-focused roommate matching and verified accommodation discovery, creating a clear opportunity for RentMate. 

## **17. Competitive Analysis** 

|**Feature**|**RentMate**|**Generic Housing Apps**|**Social Media Groups**|
|---|---|---|---|
|Student Focused|Yes|No|No|
|Verified Listings|Yes|Partial|No|
|Roommate Matching|Yes|No|No|
|Compatibility Score|Yes|No|No|
|College-Based Search|Yes|No|No|
|Expense Splitter|Yes|No|No|
|Interactive Maps|Yes|Partial|No|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 9 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

Admin Moderation Yes Partial No 

## **18. Technical Architecture** 

## **18.1 Technology Stack** 

|**Layer**|**Technology**|**Responsibility**|sponsive UI<br>s|
|---|---|---|---|
|Frontend|React.js + Tailwind CSS + Framer Mo|tion<br>User, owner, and admin interfaces; animated, re||
|Backend API|Node.js + Express.js|Authentication, business logic, REST endpoints||
|Database|MongoDB|Users, properties, roommates, expenses, review||
|Authentication|JWT|Stateless, role-based session tokens||
|Real-Time|Socket.io|Live notifications, chat, and event broadcasting||
|Maps|Google Maps API|Interactive property and neighbourhood maps||
|Media|Cloudinary|Property and profile image hosting||



## **18.2 High-Level Architecture Diagram** 

```
+----------------------+
|   Student Dashboard  |
+----------+-----------+
           |
+----------v-----------+
|    React Frontend    |
+----------+-----------+
           |
        REST API
           |
+----------v-----------+
|   Express Backend    |
+----------+-----------+
           |
   +-------+-------+
   |               |
   v               v
MongoDB        Socket.io
   |               |
User Data      Real-Time Events
Property Data  Notifications
Roommate Data  Chat System
Expense Data
```

## **19. Database Design** 

## **Users Collection** 

|**Field**|**Type**|
|---|---|
|UserID|ObjectId|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 10 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

|Name|String|
|---|---|
|Email|String|
|Role|String|
|College|String|
|Phone|String|



## **Properties Collection** 

|**Field**|**Type**|
|---|---|
|PropertyID|ObjectId|
|OwnerID|ObjectId|
|Rent|Number|
|Deposit|Number|
|Location|String|
|Amenities|Array|



## **Roommates Collection** 

|**Field**|**Type**|
|---|---|
|UserID|ObjectId|
|Preferences|Object|
|CompatibilityScore|Number|



## **Expenses Collection** 

|**Field**|**Type**|
|---|---|
|ExpenseID|ObjectId|
|Category|String|
|Amount|Number|
|CreatedAt|Date|



## **Reviews Collection** 

|**Field**|**Type**|
|---|---|
|ReviewID|ObjectId|
|PropertyID|ObjectId|
|Rating|Number|
|Comment|String|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 11 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

## **20. UI/UX Design Guidelines** 

|**Principle**|**Detail**|
|---|---|
|Design Style|Modern startup style with glassmorphism elements and smooth animations|
|Interface|Minimalistic, student-friendly, accessibility-focused|
|Responsiveness|Mobile-first design; supports mobile, tablet, and desktop|
|Theming|Dark mode, light mode, and glassmorphism elements|
|Core Pages|Home, Search, Property Details, Dashboard, Expense Tracker, Profile|



## **21. Assumptions & Constraints** 

|**Category**|**Item**|
|---|---|
|Assumption|Students have reliable internet access|
|Assumption|Property owners provide accurate listing information|
|Assumption|Users maintain updated profiles over time|
|Assumption|Students are willing to share roommate lifestyle preferences|
|Constraint|Limited project timeline (MVP scope)|
|Constraint|Web application only — no native mobile apps in MVP|
|Constraint|No payment gateway integration in MVP|
|Constraint|Limited manual moderation resources|



## **22. Future Roadmap** 

|**Phase**|**Features**|
|---|---|
|Phase 2|Mobile Application (Android & iOS), Community Forums, Enhanced Chat System, Improved Re|
|Phase 3|AI Roommate Matching, AI Property Recommendations, Fraud Detection Models, Rent Payme|



## **23. Expected Outcome** 

RentMate will provide a trusted, transparent, and student-centric accommodation ecosystem that simplifies housing discovery, improves roommate matching, reduces fraud, and enhances the relocation experience for students. 

By combining accommodation search, verification systems, compatibility-based roommate matching, and expense management into a single platform, RentMate can evolve from a project prototype into a scalable startup solution. 

## **—. API Endpoints** 

**Group Method Endpoint** 

Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

Page 12 

**RentMate  Product Requirements Document** 

Student Accommodation Platform 

|Authentication|POST|`/api/auth/register`|
|---|---|---|
|Authentication|POST|`/api/auth/login`|
|Authentication|POST|`/api/auth/logout`|
|Properties|GET|`/api/properties`|
|Properties|GET|`/api/properties/:id`|
|Properties|POST|`/api/properties`|
|Properties|PUT|`/api/properties/:id`|
|Properties|DELETE|`/api/properties/:id`|
|Roommates|GET|`/api/roommates`|
|Roommates|POST|`/api/roommates/preferences`|
|Roommates|GET|`/api/roommates/matches`|
|Expenses|POST|`/api/expenses`|
|Expenses|GET|`/api/expenses`|
|Expenses|PUT|`/api/expenses/:id`|
|Expenses|DELETE|`/api/expenses/:id`|
|Reviews|POST|`/api/reviews`|
|Reviews|GET|`/api/reviews/:propertyId`|
|Notifications|GET|`/api/notifications`|
|Notifications|PUT|`/api/notifications/read`|



Confidential — v2.0 

Team FantasticFour  |  Gryork TechPreneur Training Program 

