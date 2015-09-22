##Levels Solved For Bonus Points

### Level 2: Ramping Up
####  Level 2.1 Detach Yo' HEAD
```
git checkout C4
```

####  Level 2.2 Relative Refs(^)
```
git checkout bugFix^
```
####  Level 2.3 Relative Refs #2 (^)
```
git branch -f bugFix HEAD~2
git checkout HEAD~1
git branch -f master C6
```

####  Level 2.4 Reversing Changes in Git
```
git reset HEAD~1
git checkout pushed
git revert HEAD
```

--
### Level 3 : Moving Work Around
####  Level 3.1 Moving Work Around
```
git cherry-pick C3 C4 C7
```
####  Level 3.2 Interactive Rebase Introduction
```
git rebase -i HEAD~4 --aboveAll
```
--
### Level 4 : A Mixed Bag
####  Level 4.1 Grabbing just one commit
```
git checkout master
git cherry-pick C4
```

####  Level 4.2 Juggling Commits
```
git rebase -i HEAD~2 --aboveAll
git commit --amend
git rebase -i HEAD~2 --aboveAll
git branch -f master HEAD

```

####  Level 4.3
```
git checkout master
git cherry-pick C2
git commit --amend
git cherry-pick C3
```
####  Level 4.4
```
git tag v0 C1
git tag v1 C2
git checkout C2
```

####  Level 4.5
```
git commit
```
--
### Level 5 : Advanced Topics

#### Level 5.1:

```
git checkout bugFix
git rebase master
git checkout C4
git rebase C3'
git checkout C5
git rebase C4'
git checkout side
git rebase C5'
git checkout another
git rebase side
git branch -f master HEAD
```

####  Level 5.2
```
git branch bugWork master^^2^
```

####  Level 5.3
```
git checkout one
git cherry-pick C4 C3 C2
git checkout two
git cherry-pick C5 C4' C3'' C2'
git branch -f three C2
```
