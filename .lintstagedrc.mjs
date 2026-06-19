export default {
  '*.{js,jsx,ts,tsx,json,md,html,css,yml,yaml,toml,env*,prisma}': ['secretlint'],
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
};
