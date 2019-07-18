#!bin/bash
echo Push in current branch $TRAVIS_BRANCH
git push https://$GITHUB_TOKEN:x-oauth-basic@github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_BRANCH

echo get infos from remote
git remote update
git fetch

echo Checkout origin/master
git checkout origin/master

echo Merge on master
git merge master

echo Push on master
git push https://$GITHUB_TOKEN:x-oauth-basic@github.com/$TRAVIS_REPO_SLUG.git master
