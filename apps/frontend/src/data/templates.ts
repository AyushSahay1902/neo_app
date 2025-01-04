export interface Stack {
  id: number;
  name: string;
  title: string;
  description: string;
  files: { [key: string]: string };
  dependencies: { [key: string]: string };
}

export const stack: Stack[] = [
  {
    id: 1,
    name: "React + Node + Vitest",
    title: "React + Node + Vitest Project",
    description: "A sample project using React, Node.js, and Vitest.",
    files: {
      "package.json": JSON.stringify(
        {
          name: "react-node-vitest",
          version: "1.0.0",
          main: "index.js",
          scripts: {
            start: "node index.js",
            test: "vitest",
            dev: "vite",
          },
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
          },
          devDependencies: {
            vite: "^4.0.0",
            vitest: "^0.35.0",
          },
        },
        null,
        2
      ),
      "index.js": `
        const express = require('express');
        const app = express();

        app.get('/', (req, res) => {
          res.send('Hello from Node.js!');
        });

        app.listen(3000, () => {
          console.log('Server is running on http://localhost:3000');
        });
      `,
      "vite.config.js": `
        import { defineConfig } from 'vite';

        export default defineConfig({
          test: {
            globals: true,
            environment: 'node',
          },
        });
      `,
      "src/main.jsx": `
        import React from 'react';
        import ReactDOM from 'react-dom';

        const App = () => <h1>Hello from React!</h1>;

        ReactDOM.render(<App />, document.getElementById('root'));
      `,
      "src/index.html": `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React App</title>
        </head>
        <body>
          <div id="root"></div>
        </body>
        </html>
      `,
    },
    dependencies: {
      express: "^4.18.0",
    },
  },
  {
    id: 2,
    name: "React + Vitest",
    title: "Frontend React with Vitest",
    description: "A React template with Vitest for unit testing",
    files: {
      // Existing files for stack[1]
    },
    dependencies: {
      // Existing dependencies for stack[1]
    },
  },
  {
    id: 2,
    name: "React + Vitest",
    title: "Frontend React with Vitest",
    description: "A React template with Vitest for unit testing",
    files: {
      "src/App.tsx": `
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>React Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default App;
      `,
      "src/App.test.tsx": `
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders counter and increments', () => {
  render(<App />);
  const countElement = screen.getByText(/Count: 0/i);
  expect(countElement).toBeInTheDocument();

  const button = screen.getByText(/Increment/i);
  fireEvent.click(button);

  expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();
});
      `,
    },
    dependencies: {
      react: "^17.0.2",
      "react-dom": "^17.0.2",
      vitest: "^0.22.1",
      "@testing-library/react": "^12.1.2",
    },
  },
  {
    id: 3,
    name: "Static + Vitest",
    title: "Frontend Static with Vitest",
    description: "A static HTML/JS template with Vitest for unit testing",
    files: {
      "index.html": `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Static Counter</title>
</head>
<body>
  <h1>Static Counter</h1>
  <p id="count">Count: 0</p>
  <button id="increment">Increment</button>
  <script src="script.js"></script>
</body>
</html>
      `,
      "script.js": `
let count = 0;
const countElement = document.getElementById('count');
const incrementButton = document.getElementById('increment');

incrementButton.addEventListener('click', () => {
  count++;
  countElement.textContent = \`Count: \${count}\`;
});
      `,
      "script.test.js": `
import { expect, test } from 'vitest';
import { JSDOM } from 'jsdom';

test('increments counter on button click', () => {
  const dom = new JSDOM(\`
    <!DOCTYPE html>
    <html>
      <body>
        <p id="count">Count: 0</p>
        <button id="increment">Increment</button>
      </body>
    </html>
  \`);

  global.document = dom.window.document;
  global.window = dom.window;

  require('./script.js');

  const countElement = document.getElementById('count');
  const incrementButton = document.getElementById('increment');

  expect(countElement.textContent).toBe('Count: 0');

  incrementButton.click();

  expect(countElement.textContent).toBe('Count: 1');
});
      `,
    },
    dependencies: {
      vitest: "^0.22.1",
      jsdom: "^16.7.0",
    },
  },
  {
    id: 4,
    name: "Node + JUnit",
    title: "Backend Node with JUnit",
    description: "A Node.js backend template with JUnit for unit testing",
    files: {
      "src/app.js": `
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

module.exports = app;
      `,
      "test/app.test.js": `
const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('responds with json', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ message: 'Hello, World!' });
  });
});
      `,
    },
    dependencies: {
      express: "^4.17.1",
      supertest: "^6.1.3",
      jest: "^27.0.6",
    },
  },
  {
    id: 5,
    name: "Fullstack + MongoDB",
    title: "Fullstack MongoDB and Express",
    description: "A full-stack template with MongoDB and Express.js",
    files: {
      "src/server.js": `
const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true });

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Fullstack App!' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
      `,
    },
    dependencies: {
      express: "^4.17.1",
      mongoose: "^6.0.12",
    },
  },
  {
    id: 6,
    name: "FastAPI",
    title: "Backend FastAPI",
    description: "A Python backend template using FastAPI",
    files: {
      "main.py": `
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}
      `,
    },
    dependencies: {
      fastapi: "^0.78.0",
      uvicorn: "^0.17.0",
    },
  },
];
