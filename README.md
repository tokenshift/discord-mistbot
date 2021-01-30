# Mistbot

Mistborn RPG helper bot.

Authorization url: https://discord.com/api/oauth2/authorize?client_id=804847339579637780&permissions=75840&scope=bot

All commands start with `mb`. Use `mb help` for a list of commands.

## Commands

### General

`mb help`  
Display a list of all commands.

`mb roll {pool}`  
Roll `{pool}` 6-sided die and display the result--the highest pair from 1-5,
and the number of nudges (6's).

Any dice over 10 count as additional nudges.

If your pool is less than 2, than 2 dice are rolled and the outcome is worsened.

### Initiative Tracking

`mb init [show]`  
Display the current initiative.

`mb init start [{character name} {wits score} ...]`  
Start tracking intitiative. Characters can optionally be listed now as pairs of
`{character name} {wits score}`, or added later using `mb init join`. Add player
characters using @Mentions to tie them to their own commands later (e.g. `mb 
init pool`).

Characters will initially be placed in increasing order by Wits. This can be
overridden by using `mb init move|mv`.

Once everyone has declared their pool size, then characters will be placed in
decreasing order by pool size so they can start taking actions.

`mb init join [{character name}] {wits score} [more character + wits pairs...]`  
Add characters to initiative after it starts. If only a single Wits score is
specified, it adds the message author themselves. Otherwise, it behaves the same
way as `mb init start`, but adds additional characters to initiative.

Adding yourself with Wits 3: `mb init join 3`
Adding another character: `mb init join "John Smith" 3`

`mb init remove|rm {character names...}`  
Remove characters from initiative order. Can specify characters to remove by
name or initiative order.

`mb init move|mv {character name} {new order}`  
Move a character to a new position in the initiative order (regardless of Wits
or pool size).

`mb init clear`  
Remove all characters from initiative tracking.

`mb init pool [character] {pool size}`  
Declare the size of your own pool, or the size of another character's pool.

`mb init spend [character] {count}`  
Spend `{count}` dice out of your own die pool, or the identified `[character]`'s
pool. Will automatically roll that many dice for you.

`mb init reset`  
Reset initiative tracking; return everybody to Wits order, and clear their pools.

`mb init stop|end`  
End initiative tracking.