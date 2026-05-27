# Battleships React

A real-time multiplayer Battleship game built with React, Express, and Socket.IO. Players can compete against each other by strategically placing ships on a 10x10 grid and attempting to sink their opponent's fleet.

## 📋 Table of Contents

- [Overview](#overview)
- [Project Features](#project-features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)

## 🎮 Overview

Battleships React is a web-based implementation of the classic Battleship game. Two players connect via WebSocket and take turns attacking each other's board to sink ships. The game features real-time synchronization and an intuitive board interface.

### Game Rules
- Each player has a 10x10 grid board
- Players place 10 ships of varying lengths (5, 4, 3, 3, 2, 2, 2, 1, 1, 1)
- Players take turns attacking opponent grid cells
- A hit is marked when an attack lands on a ship; a miss is marked otherwise
- A ship is destroyed when all its cells are hit
- The game ends when one player's all ships are destroyed


## ✨ Project Features

- **Real-Time Multiplayer Gameplay**: Uses Socket.IO for instant player synchronization
- **Automatic Ship Placement**: Ships are randomly placed on the board with collision detection
- **Turn-Based System**: Clear indication of whose turn it is
- **Board Visualization**: Color-coded cells showing ships, hits, misses, and destroyed ships
- **Win/Loss Detection**: Game automatically detects and announces the winner

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────────┐          ┌──────────────────────┐
│   React Frontend    │◄────────►│   Express Backend    │
│   (Port 5173)       │ WebSocket│   (Port 8000)        │
│                     │          │                      │
│  - Board UI         │          │  - Game State        │
│  - Ship Placement   │          │  - Turn Management   │
│  - Real-time Update │          │  - Attack Handling   │
└─────────────────────┘          └──────────────────────┘
         ▲                                ▲
         │                                │
         └────────── Socket.IO ──────────┘
```

### Client Architecture (React)

The client is built with React and manages:

1. **State Management**:
   - `boardOne`: Player's own board (10x10 grid)
   - `boardTwo`: Opponent's visibility board (10x10 grid)
   - `ships`: Map of player's ships with metadata
   - `canFire`: Boolean flag indicating if it's the player's turn
   - `text`: UI status messages

2. **Key Components**:
   - **App.jsx**: Main component handling game flow and Socket.IO events
   - **board.jsx**: Board rendering component with cell interactions
   - **BoardMethods.js**: Static utility class for ship placement algorithm
   - **index.css**: Core styling for board cells and game layout
   - **App.css**: Additional UI styling

3. **Game Flow**:
   ```
   User Starts Game (Click PLAY)
        ↓
   Ship Placement (Automatic)
        ↓
   Connected to Opponent via Socket.IO
        ↓
   Receive Turn Assignment
        ↓
   Fire at Opponent's Board (if your turn)
        ↓
   Receive Opponent's Attack on Your Board
        ↓
   Update Both Boards
        ↓
   Check Win Condition
        ↓
   Game End or Continue
   ```

### Backend Architecture (Express + Socket.IO)

The backend manages game logic and real-time communication:

1. **Core Modules**:
   - **index.js**: Express server and Socket.IO connection handler
   - **Game.js**: Game state management class
   - **Player.js**: Player state and attack handling
   - **Board.js**: Board utilities and ship placement validation

2. **Game State Management**:
   - `games`: Map of active games (gameId → Game object)
   - `gamesUsers`: Map of user to game mapping (userId → gameId)
   - `queue`: Array of games waiting for a second player

3. **Socket.IO Events**:

   **Client → Server**:
   - `searchGame`: Initiate matchmaking with board and ships
   - `handleMove`: Send attack coordinates (row, col)
   - `reset`: End current game and return to lobby
   - `disconnect`: Clean up when user disconnects

   **Server → Client**:
   - `found`: Game match found, send turn information
   - `handleMove`: Receive opponent's attack result and board state
   - `end`: Game concluded, send winner status

4. **Game Logic Flow**:
   ```
   Player A connects (creates game, enters queue)
        ↓
   Player B connects (retrieved from queue, game starts)
        ↓
   Both Players Receive "found" with turn assignment
        ↓
   Current Player Emits "handleMove"
        ↓
   Backend:
     - Execute Attack (handleAttack)
     - Check Win Condition (checkWin)
     - Update Game State
     - Switch Turn (nextTurn)
        ↓
   Both Players Receive Updated Board States
        ↓
   Loop or End Game
   ```

### Data Models

**Game Object**:
```javascript
{
  id: UUID,
  turn: 'p1' | 'p2',
  p1: Player,
  p2: Player,
  hasEnded: boolean,
  winner: Player | null,
  computer: boolean
}
```

**Player Object**:
```javascript
{
  id: socketId,
  secretBoard: 10x10 Array,      // Full board with ships
  hitsBoard: 10x10 Array,        // Board showing hits/misses
  ships: Map<shipId, ShipData>,
  shipsAlive: number,            // Count of intact ships
  shots: number                  // Remaining shots (25 total)
}
```

**Ship Data**:
```javascript
{
  len: number,          // Ship length
  hits: [[row, col]],   // Array of hit coordinates
  color: string,        // Display color (client only)
  destroyed: boolean    // Whether ship is fully destroyed
}
```

**Cell States**:
- `undefined`: Empty cell (not yet revealed)
- `[shipId]`: Ship present (player's board only)
- `"hit"`: Successful attack
- `"miss"`: Failed attack
- `"destroyed"`: Ship fully destroyed

---

## 📦 Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **pnpm** (https://pnpm.io/installation)
- **Docker & Docker Compose** (optional, for containerized setup)

### Setup Using pnpm

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Frosselly/BattleshipsReact.git
   cd BattleshipsReact
   ```

2. **Install dependencies for API**:
   ```bash
   cd api
   pnpm install
   cd ..
   ```

3. **Install dependencies for Client**:
   ```bash
   cd client
   pnpm install
   cd ..
   ```

### Setup Using Docker

**Start services with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build and start the Express API server (Port 8000)
   - Build and start the React client (Port 5173)
   - Create a bridge network for inter-service communication


## 🚀 Quick Start

### Running Locally with pnpm

**Terminal 1 - Start the API server**:
```bash
cd api
pnpm install  # if not already installed
node src/index.js
```

**Terminal 2 - Start the React development server**:
```bash
cd client
pnpm install  # if not already installed
pnpm dev
```

**Open the application**:
   - Navigate to `http://localhost:5173/` in your browser
   - Open a second browser window/tab at the same URL
   - Click "PLAY" to start matching
   - Once matched, take turns attacking opponent's board

### Running with Docker

```bash
docker-compose up
```

## 🎯 Usage

### Starting a Game

1. **Place Ships**: Ships are automatically placed randomly on your board
2. **Click PLAY**: Initiates matchmaking to find an opponent
3. **Wait for Match**: The game will search for another player in the queue
4. **Receive Turn**: Once matched, you'll be notified if it's your turn

### Playing the Game

1. **Your Turn**: Click cells on the opponent's board (right side) to attack
2. **Cell Colors**:
   - **Light Gray**: Empty/unattacked cell
   - **Red/Orange**: Hit ship
   - **Blue**: Missed attack
   - **Green**: Destroyed ship
   - **Colored Cells (Left Board)**: Your ships

3. **Game End**: When all ships of either player are destroyed, the game ends with a win/loss message

### Resetting the Game

- Click the **RESET** button to return to the starting state and place new ships

### Computer Mode (Planned)

- Check the "Computer" checkbox before playing to play against AI (feature in development)


## 🛠️ Technology Stack

### Frontend
- **React**: UI framework
- **Socket.IO Client**: WebSocket client library

### Backend
- **Express.js**: Web framework
- **Socket.IO**: Real-time WebSocket library
- **CORS**: Cross-origin resource sharing middleware

## 📁 Project Structure

```
BattleshipsReact/
├── api/
│   ├── src/
│   │   ├── index.js           # Express server and Socket.IO setup
│   │   ├── Game.js            # Game state management
│   │   ├── Player.js          # Player state and attack logic
│   │   └── Board.js           # Board utilities
│   ├── package.json           # API dependencies
│   └── Dockerfile             # API container config
│
├── client/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main game component
│   │   ├── board.jsx          # Board display component
│   │   ├── BoardMethods.js    # Ship placement utilities
│   │   ├── App.css            # App styling
│   │   └── index.css          # Global & board styling
│   ├── package.json           # Client dependencies
│   ├── vite.config.js         # Vite configuration
│   └── Dockerfile             # Client container config
│
├── package.json               # Root package config
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # This file
```

### Key File Descriptions

**api/src/index.js**:
- Sets up Express server on port 8000
- Initializes Socket.IO with CORS for localhost:5173
- Handles player connections and game events
- Manages game queue and matchmaking

**api/src/Game.js**:
- Manages overall game state
- Tracks turn order (p1 vs p2)
- Detects win conditions
- Handles move sequencing

**api/src/Player.js**:
- Maintains player boards (secret and hits)
- Processes incoming attacks
- Tracks ship health
- Manages shot count

**client/src/App.jsx**:
- Main React component
- Manages local game state
- Sets up Socket.IO listeners
- Controls game flow (play, reset, fire)

**client/src/BoardMethods.js**:
- Static methods for ship placement algorithm
- Validates ship placements
- Generates random board configurations


## 🔧 Configuration

### Port Configuration

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

To change ports, modify:
- Backend: `api/src/index.js` (PORT variable)
- Frontend: `client/vite.config.js` (server configuration)
- Docker: `docker-compose.yml`

### CORS Settings

Currently, CORS is configured for `http://localhost:5173`. To allow other origins, modify:
```javascript
// api/src/index.js
cors({
  credentials: true,
  origin: "YOUR_ORIGIN_HERE"
})
```

## 📝 Development Notes

### Ship Placement Algorithm

Ships are placed randomly with validation:
1. Generate random position (x, y) and orientation (horizontal/vertical)
2. Check if placement is valid (not overlapping existing ships, within bounds)
3. Place ship and mark grid cells
4. Repeat for all 10 ships

**Validation Checks**:
- Position must be within 10x10 grid
- Ship cannot overlap with existing ships
- Entire ship length must fit in selected direction

### Turn Management

- Each player starts with 25 shots
- Turn switches after each successful or failed attack
- Win condition: Opponent has 0 ships remaining OR player has 0 shots (tie scenario)

### Real-Time Synchronization

- All game state updates flow through Socket.IO events
- Client-side state updates are event-driven
- Server maintains authoritative game state
- No direct client-to-client communication (secure centralized model)

## 🐛 Possible improvements

- Computer AI opponent
- Game lobby and room management
- Player statistics and rankings
- Game replay functionality

