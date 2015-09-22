### Level 1: Introduction Sequence

####  Level 1.1 Commands Below
```
git commit
git commit
```

####  Level 1.2 Branching in git
```
git branch bugFix
git checkout bugFix
```

####  Level 1.3 Merge
```
git checkout -b bugFix
git commit
git checkout master
git commit
git merge bugFix
```

####  Level 1.4 Rebase Introduction
```
git checkout -b bugFix
git commit
git checkout master
git commit
git checkout bugFix
git rebase master
```
