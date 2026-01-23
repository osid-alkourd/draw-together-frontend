# Draw Together – Frontend

Draw Together is a web-based collaborative whiteboard application that allows users to create boards, draw freely, add shapes and text, and collaborate with others in real time. The frontend provides an intuitive and responsive interface focused on creativity, teamwork, and smooth user experience.

This project consumes the Draw Together Backend API for authentication, whiteboard management, snapshots, and real-time collaboration via WebSockets. It is built to work seamlessly with the backend to deliver a complete collaborative drawing experience.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### UI & Styling
- Tailwind CSS
- Lucide Icons

### Real-Time Communication
- Socket.IO Client

## Installation

### 1. Run the backend first

This frontend application depends on the Draw Together backend API.
Before running the frontend, make sure the backend repository is installed and running on port 8000.

Backend repository:
https://github.com/osid-alkourd/draw-togother-backend

Follow the backend installation steps and ensure the server is running at:
http://localhost:8000

### 2. Clone the frontend repository

```bash
git clone https://github.com/osid-alkourd/draw-together-frontend
cd draw-together-frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root and add the following variable:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
```

This variable tells the frontend where the backend API is running.

### 5. Start the development server

```bash
npm run dev
```

The application will be available at:
http://localhost:3000

## Backend Repository

Backend repo: https://github.com/osid-alkourd/draw-togother-backend

## Screenshots

### Landing Page

<table>
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091201/landing_page_1_1_xffrur.png" alt="Landing Page 1" width="100%"/>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091192/landing_page_2_uvngp1.png" alt="Landing Page 2" width="100%"/>
    </td>
  </tr>
</table>

### Dashboard

<table>
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091198/dashboard-1_kzpdzy.png" alt="Dashboard 1" width="100%"/>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091188/dashboard-2_e2gfgj.png" alt="Dashboard 2" width="100%"/>
    </td>
  </tr>
</table>

### My Whiteboards Page

<img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091210/my-whiteboars-page_xh07ct.png" alt="My Whiteboards Page" width="100%"/>

### Whiteboards Shared With Me

<img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091209/whiteboards-shared-with-me_fotaso.png" alt="Whiteboards Shared With Me" width="100%"/>

### My Whiteboard

<table>
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091199/my-whiteboard-1_elb57x.png" alt="My Whiteboard 1" width="100%"/>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091201/my-whiteboard-2_dqvicq.png" alt="My Whiteboard 2" width="100%"/>
    </td>
  </tr>
</table>

### Add New User to My Whiteboard

<img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091191/add-new-user-to-whiteboard_lcfujx.png" alt="Add New User to My Whiteboard" width="100%"/>

### Create New Whiteboard

<table>
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091192/create_new_whiteboard_1_eiasgj.png" alt="Create New Whiteboard 1" width="100%"/>
    </td>
    <td align="center">
      <img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091197/create_new_whiteboard_2_p2mo8x.png" alt="Create New Whiteboard 2" width="100%"/>
    </td>
  </tr>
</table>

### Shared Whiteboard

<img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091209/specific-whiteboard-shared-with-me_s59osc.png" alt="Shared Whiteboard" width="100%"/>

### Register Page

<img src="https://res.cloudinary.com/dveucsumj/image/upload/v1769091207/register_f7ime5.png" alt="Register Page" width="100%"/>
