#!bin/bash
echo Push in current branch $TRAVIS_BRANCH
git push https://$GITHUB_TOKEN:x-oauth-basic@github.com/$TRAVIS_REPO_SLUG.git $TRAVIS_BRANCH

echo Control remote
git config --get remote.origin.fetch

echo Set remote origin
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

echo get infos from remote
git remote update
git fetch

echo Checkout master
git checkout master

echo Merge on master
git merge $TRAVIS_BRANCH

echo Push on master
git push https://$GITHUB_TOKEN:x-oauth-basic@github.com/$TRAVIS_REPO_SLUG.git master
