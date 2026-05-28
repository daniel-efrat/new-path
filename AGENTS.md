## Dev server rule

This is a Next.js app.

The default dev server port is 3000.

Before starting or restarting the dev server, always check whether port 3000 is already occupied.

Do not start Next.js on an alternate port such as 3001, 3002, etc.

If port 3000 is occupied, identify and kill the existing process first, then start the server again on port 3000.

Preferred macOS/Linux command:

```bash
PORT=3000
PID=$(lsof -ti tcp:$PORT)

if [ -n "$PID" ]; then
  echo "Killing process on port $PORT: $PID"
  kill -15 $PID || true
  sleep 1
  kill -9 $PID 2>/dev/null || true
fi

npm run dev


Even better, enforce it in `package.json`:

```json
{
  "scripts": {
    "dev": "npm run kill:dev-port && next dev -p 3000",
    "kill:dev-port": "lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true"
  }
}

## Running the dev server

Always start the app with:

```bash
npm run dev

## Running the dev server

Always start the app with:

```bash
npm run dev        