#!/bin/bash

# Setup script for Credential Verification System
# Installs all dependencies and configures the project

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Credential Verification System - Setup Script             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
node_version=$(node -v)
npm_version=$(npm -v)
echo "Node.js version: $node_version"
echo "npm version: $npm_version"
echo ""

# Install root dependencies
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..
echo ""

# Setup environment files
echo -e "${BLUE}Setting up environment files...${NC}"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "${YELLOW}Created backend/.env from .env.example${NC}"
  echo -e "${YELLOW}Please update the contract addresses after deployment!${NC}"
else
  echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

echo ""

# Compile smart contracts
echo -e "${BLUE}Compiling smart contracts...${NC}"
cd backend
npm run compile
echo -e "${GREEN}✓ Smart contracts compiled${NC}"
cd ..
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║               Setup Complete!                              ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║ Next steps:                                                ║"
echo "║                                                            ║"
echo "║ 1. Start local blockchain node:                            ║"
echo "║    cd backend && npm run node                              ║"
echo "║                                                            ║"
echo "║ 2. In a new terminal, deploy contracts:                    ║"
echo "║    cd backend && npm run deploy-local                      ║"
echo "║                                                            ║"
echo "║ 3. Update .env with contract addresses from deployment     ║"
echo "║                                                            ║"
echo "║ 4. Start backend server:                                   ║"
echo "║    cd backend && npm start                                 ║"
echo "║                                                            ║"
echo "║ 5. Access admin dashboard at:                              ║"
echo "║    http://localhost:3000/admin                             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
