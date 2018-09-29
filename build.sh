GLOBAL_NAME=CurvyTabs

MODULE_NAME=$(cat package.json | sed -En 's/.*"name": "(.*)".*/\1/p')

VER=$(cat package.json | sed -En 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p')

# update the `version` property in the code with value from package.json
sed -i '' -E 's/[0-9]+\.[0-9]+\.[0-9]+/'${VER}'/' index.js

mkdir umd 2>/dev/null

echo '(function(){' > umd/$MODULE_NAME.js
sed 's/module.exports =/window.'GLOBAL_$NAME' =/' index.js >> umd/$MODULE_NAME.js
echo '})();' >> umd/$MODULE_NAME.js

uglifyjs umd/$MODULE_NAME.js -cmo umd/$MODULE_NAME.min.js

ls -lahL umd