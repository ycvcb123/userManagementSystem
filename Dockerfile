FROM node:16-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
<<<<<<< HEAD
RUN npm install
=======
#--registry=https://registry.npmmirror.com/
RUN npm install 
>>>>>>> user-management-system-gitactions

COPY . /usr/src/app/
RUN npm run tsc 
EXPOSE 7001

CMD npx egg-scripts start --title=demo-egg


# FROM node:16-alpine
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# COPY . /usr/src/app/

# RUN npm install --registry=https://registry.npmmirror.com/
# RUN npm run tsc 

# EXPOSE 7001

# CMD npx egg-scripts start --title=demo-egg