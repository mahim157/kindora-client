# 🌱 Kindora | Social Development Events Platform

**Kindora** is a community-driven social development platform designed to bring people together through meaningful community service activities. It allows users to discover upcoming events, create initiatives, participate in social activities, and contribute to building a better community.

## 🌐 Live Application

**Live Website:** [https://kindora-client-qvje.vercel.app](https://kindora-client-qvje.vercel.app)

**Client Repository:** [GitHub](https://github.com/mahim157/kindora-client)

**Server Repository:** [GitHub](https://github.com/mahim157/kindora-server)

## ✨ Key Features

- **User Authentication:** Secure user registration and login using Better Auth.
- **Explore Upcoming Events:** Discover community service events and volunteering opportunities.
- **Event Details:** View detailed information about individual events.
- **Create Events:** Allow authenticated users to organize and publish new community events.
- **Manage Events:** Update or delete events created by the logged-in user.
- **Join Events:** Participate in events and become part of community initiatives.
- **Joined Events:** View and track all events joined by the user.
- **Profile Management:** Manage personal profile information.
- **Dark and Light Theme:** Switch between light and dark modes for a comfortable browsing experience.
- **Responsive Interface:** Optimized for desktop, tablet, and mobile devices.

## 🛠️ Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Authentication & Database

- Better Auth
- MongoDB

### Deployment

- Vercel

## 📁 Project Structure

```text
client/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── upcoming-events/
│   │   │   └── page.tsx
│   │   ├── create-event/
│   │   │   └── page.tsx
│   │   ├── manage-events/
│   │   │   └── page.tsx
│   │   ├── joined-events/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   
│   │  
│   └── lib/
│       ├── auth.ts
│       ├── auth-client.ts
│       
├── public/
├── package.json
└── README.md
```

## 🚀 Getting Started

Follow these instructions to run the frontend application locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/mahim157/kindora-client.git
```

### 2. Navigate to the Project Directory

```bash
cd kindora-client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and configure the required environment variables.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Add any additional environment variables required by your actual project configuration.

**Important:** Never upload `.env.local` or expose private credentials in your GitHub repository.

### 5. Run the Development Server

```bash
npm run dev
```

Open your browser and visit:

[http://localhost:3000](http://localhost:3000)

## 🔗 Backend Integration

Kindora uses a separate backend application to handle server-side operations, database communication, and protected API requests.

**Backend Live URL:** [https://kindora-server-mocha.vercel.app](https://kindora-server-mocha.vercel.app)

**Backend Repository:** [mahim157/kindora-server](https://github.com/mahim157/kindora-server)

For local development, make sure the backend server is running and the frontend API URL is configured correctly.

## 🎯 Project Purpose

Kindora aims to encourage social responsibility by making it easier for people to connect, organize community service activities, and participate in initiatives that create a positive impact.

---

**Developed with ❤️ for community development and social impact.**
