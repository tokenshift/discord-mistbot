# Mistbot

Mistborn RPG helper bot.

Authorization url: https://discord.com/api/oauth2/authorize?client_id=804847339579637780&permissions=75840&scope=bot

All commands start with `mb`. Use `mb help` for a list of commands.

## Commands

### General Commands

> **mb help**

Display this help text.

> **mb version**

Display the current Mistbot version number.

> **mb roll {pool}**

Roll a pool of dice, Mistborn style.

### Initiative Tracking

> **mb init help**

Show this help text.

> **mb init [show]**

Display the current initiative order/

> **mb init start [{character name} {wits score} ...]**

Start tracking intitiative. Characters can optionally be listed now as pairs of
`{character name} {wits score}`, or added later using `mb init join`. Add player
characters using @Mentions to tie them to their own commands later (e.g. `mb
init pool`).

Characters will initially be placed in increasing order by Wits. This can be
overridden by using `mb init move|mv`.

Once everyone has declared their pool size, then characters will be placed in
decreasing order by pool size so they can start taking actions using `mb init
spend`.

> **mb init join {wits score}**

Add yourself to initiative with the specified Wits score.

> **mb init join {character name} {wits score} ...**

Add a list of characters to initiative.

> **mb init move|mv {character name} {new order}**

Move a character to a new position in the initiative order (regardless of Wits
or pool size).

> **mb init update {character} {wits}**

Modify the Wits score of a character already in the initiative list.

> **mb init pool [{character}] {pool}**

Declare the size of your own pool, or the size of another character's pool.

> **mb init spend [character] {dice}**

Spend {count} dice out of your own die pool, or the identified `[character]`'s
pool. Will automatically roll that many dice for you.

> **mb init sort**

Sort the initiative list by Wits or pool size.

> **mb init remove|rm {character name}**

Remove a character from initiative order. Can specify character to remove by name or initiative order.

> **mb init reset**

Reset all characters' pools for the next round of combat.

> **mb init clear**

Remove all characters from initiative tracking.

> **mb init stop|end|done**

End initiative tracking.