# run from master branch!
# assumes gh-pages branch already exists

npm run build

VER=$(cat package.json | sed -En 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p')
mkdir $VER
cp index.html $VER
mkdir $VER/build
mv build/*.* $VER/build

git checkout gh-pages
git add $VER
git status
git commit -am $VER

git push origin gh-pages

git checkout master
