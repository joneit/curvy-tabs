# run from master branch!
# assumes gh-pages branch already exists

npm run build

VER=$(cat package.json | sed -En 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p')
mkdir $VER
mv index.html $VER
mkdir $VER/build
mv build/*.js $VER/build

git checkout gh-pages
rm .gitignore .npmignore *.md *.js *.html *.sh *.json
git add $VER
git status
git commit -am $VER

git push origin gh-pages

git checkout master
