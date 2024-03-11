# Project Y
## Getting Started

First, install dependencies:

```bash
npm installe
```

Then run the development server:

```bash
npm run dev
```
## Configuring project
Since some of the functionalities of this project require third party products, you will need to configure them using your personal data and account.

### Clerk configuration
Firstly, go to https://clerk.com -> "Start building for free" and log in/sign up with your credentials. Then, create application, select Email, Google, Username and Github authentication methods and you will be presented with auth keys you will have to use.

For this, inside project's root create '.env.local' file and paste your keys there so it looks like this:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xvc2luZy13ZWFzZWwtNzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_BadRDj8SEzXFcH1ZYYtYux0xyyzv7id27VDKJGmGXk
```

### MongoDb configuration


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.