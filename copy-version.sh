touch package.json.tmp
new_version=$(jq ".version" dist/package.json)
jq ".version=$new_version" package.json > package.json.tmp
mv package.json.tmp package.json