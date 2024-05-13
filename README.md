
## Installation

Install project with npm

```bash
  npm install
  npm start
```
    
## Tech Stack Used

- Node Js
- Express Js
- Postgres (Online hosted database)
- Sequelize (ORM for database)

## Folder Structure
.
├── server.js - Server starting point
├── routes.js - REST API handle endpoints
├── socketRoutes.js - WebSocket handle endpoints
├── controllers/ 
│   ├── meetingController.js
│   └── userController.js
├── middlewares/
│   └── auth.js
├── sequelize/
│   ├── config/
│   └── models/
└── services/
    ├── meetingService.js
    ├── socketService.js
    └── userService.js

