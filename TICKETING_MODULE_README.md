# Maintenance & Incident Ticketing Module

## Overview
This is a comprehensive ticketing system for managing maintenance requests and incident reports across the Smart Campus. It includes both backend (Spring Boot) and frontend (React) implementations.

## Features

### Backend Features
- **Create Tickets**: Submit new maintenance and incident tickets with detailed information
- **View Tickets**: Retrieve all tickets or filter by various criteria
- **Update Tickets**: Modify ticket status, priority, assignments, and add resolutions
- **Delete Tickets**: Remove tickets from the system
- **Search & Filter**: Find tickets by keyword, status, priority, or category
- **Dashboard Stats**: Get real-time statistics on ticket metrics
- **MongoDB Integration**: Persistent data storage with flexible schema

### Frontend Features
- **Ticket Management Dashboard**: View all tickets with real-time statistics
- **Create Ticket Form**: User-friendly form to submit new tickets
- **Ticket Details View**: Detailed view of individual tickets with all information
- **Edit Tickets**: Modify existing ticket details
- **Search & Filter**: Advanced filtering by status, priority, and keyword search
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic refresh of ticket data

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.13
- **Language**: Java 21
- **Database**: MongoDB
- **API**: RESTful API with JSON
- **Security**: Spring Security with OAuth2

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3

## Project Structure

```
Smart_campus/
├── smart-campus-api/
│   └── src/main/java/com/smartcampus/
│       ├── controller/ticket/
│       │   └── TicketController.java
│       ├── service/ticket/
│       │   └── TicketService.java
│       ├── repository/ticket/
│       │   └── TicketRepository.java
│       ├── model/ticket/
│       │   └── Ticket.java
│       └── dto/
│           ├── request/
│           │   ├── CreateTicketRequest.java
│           │   └── UpdateTicketRequest.java
│           └── responce/
│               └── TicketResponse.java
│
├── smart-campus-client/
│   └── src/
│       ├── api/
│       │   └── ticketAPI.js
│       ├── pages/tickets/
│       │   ├── TicketsPage.jsx
│       │   └── TicketDashboard.jsx
│       ├── components/
│       │   ├── TicketCard.jsx
│       │   ├── TicketForm.jsx
│       │   └── TicketList.jsx
│       └── styles/
│           ├── TicketsPage.css
│           ├── TicketCard.css
│           ├── TicketForm.css
│           ├── TicketList.css
│           └── TicketDashboard.css
```

## API Endpoints

### Base URL
```
http://localhost:8080/api/tickets
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new ticket |
| GET | `/` | Get all tickets |
| GET | `/{id}` | Get ticket by ID |
| PUT | `/{id}` | Update a ticket |
| DELETE | `/{id}` | Delete a ticket |
| GET | `/status/{status}` | Get tickets by status |
| GET | `/priority/{priority}` | Get tickets by priority |
| GET | `/assigned/{userId}` | Get tickets assigned to user |
| GET | `/created-by/{userId}` | Get tickets created by user |
| GET | `/category/{category}` | Get tickets by category |
| GET | `/search?keyword={keyword}` | Search tickets |
| GET | `/open/list` | Get all open tickets |
| GET | `/dashboard/stats` | Get dashboard statistics |

## Database Models

### Ticket Entity
```json
{
  "id": "string (MongoDB ObjectId)",
  "title": "string",
  "description": "string",
  "category": "string (MAINTENANCE, REPAIR, CLEANING, etc.)",
  "priority": "string (LOW, MEDIUM, HIGH, CRITICAL)",
  "status": "string (OPEN, IN_PROGRESS, RESOLVED, CLOSED, ON_HOLD)",
  "assignedTo": "string (optional)",
  "createdBy": "string",
  "createdAt": "ISO 8601 DateTime",
  "updatedAt": "ISO 8601 DateTime",
  "resolvedAt": "ISO 8601 DateTime (optional)",
  "location": "string (optional)",
  "attachmentUrl": "string (optional)",
  "estimatedDays": "integer",
  "resolution": "string (optional)",
  "notes": "string (optional)"
}
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd smart-campus-api
   ```

2. Configure MongoDB connection in `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/smart_uni_db
   ```

3. Build the project:
   ```bash
   mvn clean install
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd smart-campus-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided URL (typically `http://localhost:5173`)

## Usage Examples

### Creating a Ticket
1. Click on "New Ticket" button
2. Fill in the ticket details:
   - Title (required)
   - Description (required)
   - Category (required)
   - Priority (required)
   - Location (optional)
   - Estimated Days (optional)
3. Click "Submit Ticket"

### Viewing Tickets
1. Navigate to the Tickets page
2. Use filters to narrow down tickets:
   - Filter by Status
   - Filter by Priority
   - Search by keyword
3. Click on a ticket card to view full details

### Editing a Ticket
1. Click on a ticket to view details
2. Click "Edit Ticket" button
3. Update the required fields
4. Click "Submit Ticket" to save changes

### Dashboard
- Access the dashboard to see:
  - Total ticket count
  - Number of open tickets
  - Critical tickets count
  - Recent tickets list
  - Pending tickets overview

## Ticket Categories
- MAINTENANCE
- REPAIR
- CLEANING
- PLUMBING
- ELECTRICAL
- HVAC
- OTHER

## Ticket Priorities
- LOW
- MEDIUM
- HIGH
- CRITICAL

## Ticket Statuses
- OPEN: Newly created ticket
- IN_PROGRESS: Currently being worked on
- ON_HOLD: Waiting for external resources or information
- RESOLVED: Issue has been fixed
- CLOSED: Ticket is complete and archived

## Features to Note

### Smart Status Updates
- When a ticket is marked as RESOLVED or CLOSED, the system automatically records the `resolvedAt` timestamp
- When updating a ticket, the `updatedAt` timestamp is automatically set

### Search Functionality
- Case-insensitive search across title and description
- Regex-based searching for flexible pattern matching

### Filtering
- Filter by single or multiple criteria
- Real-time filter results

### Responsive Design
- Mobile-friendly interface
- Adaptive grid layouts
- Touch-friendly buttons and controls

## Future Enhancements
- Email notifications for ticket updates
- File attachment support
- User role-based access control
- Ticket commenting system
- SLA tracking
- Advanced reporting and analytics
- Integration with facility management systems
- Automated ticket routing
- Mobile app version

## Branch Information
This module is developed on the `feature/maintenance-ticketing` branch to ensure team collaboration without affecting other modules.

## Contact & Support
For questions or issues related to the Maintenance & Incident Ticketing module, please refer to the project documentation or contact the module developer.
