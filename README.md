# Church Hub

<p align="center">A monorepo containing web and native applications for a web-based church back office system and a mobile app for the average user to access information from their church.</p>

---

## Installation

```bash
# Clone github repo
git clone git@github.com:EduardoAmorimDev/church-hub.git

# Install dependencies
npm install

# Currently runs web app dev and build storybook and tokens package
npm run dev
```

## Project Structure

```
├── apps/
│   ├── native/             # React Native (Expo) app
│   └── web/                # Next.js app with Storybook
└── packages/
    ├── docs/                # Documentation
    ├── eslint-config/       # Global ESLint config
    ├── tokens/              # Design tokens (colors, font, sizes, etc...)
    └── typescript-config/   # Global Typescript config
```

## Documentation

- [Color System](./packages/docs/color-system.md)
