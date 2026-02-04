This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Demo Vercel

+ Quick Demo: [Deployed Here! Try it!](https://frontend-tc-llm-generator.vercel.app)

<div align="center">
  <img src="images/dashboard-image.png" alt="Image 1" width="500"/>
</div>

## Getting Started

Quick start on `Local`:

```bash
# clone project and move to the right branch
git clone https://github.com/cggithub333/Frontend-TC-LLM-Generator.git Frontend_TC_LLM_Generator && cd Frontend_TC_LLM_Generator
git checkout feature/integrate-ui

# Stand at root path and run this one
npm install

# Run mock api data
npm run mock-api
```

```bash
# Open another terminal/cmd and run this
cp .env.example .env
npm run dev
```

+ Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## For Contributors

+ Install Husky
```bash
# check for husky existed or not
which husky # for linux terminal
where husky # for windows cmd

# if it's not existed, then install by this command
npm install -g husky

# then run this command at root path of the project
husky install
```

## Font

+ This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
