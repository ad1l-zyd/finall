#!/bin/bash
# Frontend Setup Script

echo "🚀 Setting up frontend for Credential Verification System"

# Check if ethers library exists in root libs folder
if [ ! -f "libs/ethers.umd.min.js" ]; then
    echo "❌ Error: libs/ethers.umd.min.js not found in project root"
    echo "   Please ensure the ethers UMD library is present"
    exit 1
fi

# Copy ethers library to shared libs
echo "📁 Copying ethers library..."
mkdir -p frontend/shared/libs
cp libs/ethers.umd.min.js frontend/shared/libs/
echo "✅ ethers library copied"

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start the backend:"
echo "   cd backend"
echo "   npm install"
echo "   npm run node"
echo ""
echo "2. In another terminal, deploy contracts:"
echo "   npm run deploy-local"
echo ""
echo "3. Start a local HTTP server (from project root):"
echo "   python -m http.server 5500"
echo "   # or: http-server -p 5500"
echo ""
echo "4. Access dashboards:"
echo "   http://localhost:5500/frontend/admin/"
echo "   http://localhost:5500/frontend/institution/"
echo "   http://localhost:5500/frontend/student/"
echo "   http://localhost:5500/frontend/employer/"
