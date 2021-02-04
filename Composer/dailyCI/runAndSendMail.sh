#!/bin/bash

kill -9 `ps aux | grep start:server | awk '{print $2}'`
kill -9 `ps aux | grep @bfc/server | awk '{print $2}'`
kill -9 `ps aux | grep build/init.js | awk '{print $2}'`
echo 'Pulling latest code'
cd /home/azureuser/BotFramework-Composer/Composer
git fetch --all
git reset --hard HEAD
git pull
/home/azureuser/.npm-global/bin/yarn && /home/azureuser/.npm-global/bin/yarn build 
/home/azureuser/.npm-global/bin/yarn start &

sleep 10

cd /home/azureuser/LuisE2E
echo 'Run npm test ...'
npm run test

#echo 'Converting to email ...'
#python3 -m premailer -f test-report.html -o test-report-email.html

#echo 'Send email ...'
#npm run mail