# Project Y
## Getting Started

First, install dependencies:

```bash
npm instal
```
## Configuring project
Since some of the functionalities of this project require third party products, you will need to configure them using your personal data and account.

### Clerk configuration
Firstly, go to https://clerk.com -> "Start building for free" and log in/sign up with your credentials. Then, create application, select Email, Google, Username and Github authentication methods and you will be presented with auth keys you will have to use.

For this, inside project's root create '.env.local' file and paste your keys there, so it looks like this:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xvc2luZy13ZWFzZWwtNzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_BadRDj8SEzXFcH1ZYYtYux0xyyzv7id27VDKJGmGXk
```
after you added this, also add this text after those keys:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### MongoDb configuration

Go to https://www.mongodb.com, click "Start free" and log in/sign up with your Google account. 

Answer the small questionnaire(doesn't matter) and for "Deploy your database" select MO, free tier.
Then leave everything as it is (Provider: AWS, Region: Stockholm(eu-north-1)), select or leave default name for Cluster and click "Create" 

Then for Security Quickstart, select your username and password(remember it) and click "Create User"

Select "My local environment" for environment options, then click "Add My Current IP Address"(if it says "This IP address is already been added" then it's okay, you did everything correctly) and click "Finish ad close"

Since we want users to be able to connect from anywhere in the world, we will need to allow connections fom all IPs in the world, so we are not finished yet. Under "Security" on the left sidebar, go to "Network Access"  and click "ADD IP ADDRESS"
Then click "ALLOW ACCESS FROM ANYWHERE" and "Add IP address". If all done correctly, you should receive email on your Google account from Mongo,saying  "You've added "Allow access from anywhere""

Following this, under "DEPLOYMENT", go to Database and click "Connect" to cluster you just created nad in the pop-up select first option, "Drivers. 
Then, make sure you installed all dependencies, leave everything as it is(Driver is Node.js, version > 5.5) ***BUT*** copy code that mongo gives you(short version, NOT the full code example)
and save it somewhere.

Go to .env.local you created earlier and add new value and paste your link like this:

```bash
MONGODB_URL=mongodb+srv://(your_logind):<password>........
```
and then replace <password> with password you set up earlier
Then run the development server:

```bash
npm run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.