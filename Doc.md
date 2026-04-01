# Fantasy-League-Manager
## Project Overview
The Fantasy League Manager is a full-stack web application designed for interactive sports team management. It allows users to participate in various sports leagues, specifically soccer and basketball, by building and persisting custom rosters. The platform emphasizes real-time UI feedback, drag-and-drop interactivity for lineup adjustments, and seamless synchronization with a MongoDB backend.

## Core Features
1. Multi-Sport Support: Unified interface for managing both soccer and basketball teams with sport-specific logic.

2. Dynamic Formations: Supports multiple tactical setups (e.g., 4-3-3, 4-4-2 for soccer; Standard, Small Ball for NBA) that automatically reposition player slots.

3. Interactive Roster Management:
Drag-and-Drop: Users can swap players between positions or move them from the bench to the starting lineup using native browser drag events.

4. Real-Time Validation: Optional chaining and null-checks ensure the UI remains stable during asynchronous data transitions or when slots are empty.

5. Persistence Layer: A dedicated REST API handles full-roster updates, allowing users to save their entire team configuration in a single transaction.

6. Transfer Market Integration: Functional search and pick system to fetch available athletes from the database and assign them to specific team roles.

## Technology Stack
### Frontend: React, Tailwind CSS, Axios.

### Backend: Node.js, Express.js.

### Database: MongoDB with Mongoose ODM for schema modeling and data population.

### Authentication: Custom AuthContext for securing user-specific team data.