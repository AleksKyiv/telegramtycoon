# AI Operator Protocol

This protocol turns the product mirror into daily working behavior.

The point is not to make the owner manage AI. The point is to make Codex manage itself.

## 1. Decode

When the owner writes a request, Codex must translate it internally:

```text
What is the real product problem?
Which mirror ID owns it?
Which layer owns it?
Is it a refinement, a repair, or a new feature?
```

## 2. Scope Lock

Codex must lock the scope before editing:

```text
I will change:
I will not change:
I will ask first if:
```

Concrete requests are not invitations to redesign nearby systems.

## 3. Layer Audit

Before a refinement, Codex must inspect the existing implementation.

Codex must prefer this:

```text
modify existing selector/function/state path
```

over this:

```text
add new panel
add new wrapper
add late CSS override
add new state path
```

New layers are allowed only when the existing layer cannot support the requested behavior.

## 4. Change Budget

Default budget for a small UI/gameplay request:

```text
1 mirror ID
1 component
1 layer
1-3 files
0 unrelated copy changes
0 economy changes
0 backend changes
```

If the task needs more, Codex must pause and explain why.

## 5. Stars Gate

Stars are central to the product, but they must never be half-built.

Every Stars change must include:

```text
visible offer
server product
Telegram payment path
reward application
persisted ownership/state
admin/payment visibility when relevant
verification
```

If Codex cannot complete the chain, it must not create the paid feature.

## 6. Visual Mirror Report

Every implementation response must end with:

```text
Mirror ID:
Changed:
Removed:
Not touched:
Verified:
Visual status:
Risk:
Not deployed:
```

If Browser verification fails, Codex must say:

```text
Visual status: not visually verified, browser tool unavailable.
```

## 7. Server Visibility Gate

Before telling the owner to look at the browser, refresh, or open a URL, Codex must prove that the local server is actually alive.

Required checks:

```text
1. Confirm localhost:4173 is reachable.
2. Confirm /api/health returns ok.
3. Confirm the requested page route returns the expected HTML marker.
4. Confirm the requested API route returns the expected JSON marker when relevant.
5. If the server is not alive, start it persistently before asking the owner to look.
```

For this project, route markers are:

```text
/ -> "Green Farm Tycoon" and "farmRoom"
/operator -> "Product Mirror"
/api/operator/mirror -> {"ok":true}
```

Codex must not say "it works" only because a short-lived command returned ok once. The server must still be reachable after the check.

If the in-app browser tool is unavailable, Codex must report:

```text
Server status: alive / not alive
Route checked:
Browser status: not controlled, user must refresh/open URL manually
```

This gate exists because sandbox-started server processes may disappear after the shell command ends.

## 8. Regression Handling

When the owner says something is wrong, Codex must not defend the old change.

It must write:

```text
FAILURE:
CAUSE:
FIX NOW:
RULE ADDED:
```

Then it must fix only the named problem.

## 9. Layer Cleanup Duty

After fixing a bad refinement, Codex must look for dead layers from its own previous change:

```text
unused ID
unused handler
unused selector
duplicated CSS override
temporary visual block
```

Remove only the dead layer caused by the current or previous Codex change. Do not clean unrelated code without permission.

## 10. Product Quality Bar

The product target is not "working demo". The target is a premium Telegram product.

Codex should protect:

- first 30 seconds of Farm clarity;
- Stars value and payment trust;
- visual minimalism without text clutter;
- Telegram mobile constraints;
- Admin visibility for money and users;
- a clean path from Farm to Lab depth.

## 11. Default Next Step

When unsure, Codex should not improvise.

Default action:

```text
inspect -> identify mirror ID -> reduce scope -> make smallest safe edit -> verify -> report
```
