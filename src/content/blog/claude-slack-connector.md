---
title: "What Claude's Slack connector actually does"
shortTitle: "Claude's Slack connector"
date: 2026-10-29
tags: ["ai"]
description: "A tested teardown of Claude's Slack connector: it reads DMs, its consent rule is a sentence to the model, and it can post and schedule messages that its docs page never mentions."
published: true
---

Tested October 1, 2026. Re-checked against the live tool definitions and Anthropic's documentation on October 14 and October 29, 2026. Every claim below is marked **tested** (a call I made and a response I saw), **stated** (what the tool definition or Anthropic's docs say, not exercised), **inferred**, or **untested**.

## scope, so you can reproduce it

- Workspace: a small Slack workspace I own and administer. One human, me, plus two bots. Four public channels, no private channels, no Slack Connect, no Enterprise Grid. That let me test what the connector reads and how it behaves. It did not let me test whether it reaches other people's private channels and DMs. Don't read silence on that as a yes or a no.
- Claude plan: personal Max (the 5x tier). Anthropic's docs say the connector is for Team and Enterprise; it was available to me regardless. Worth asking about.
- Surface: calls were made by Claude running as an agent (Cowork), where the model calls tools directly. This is not the claude.ai chat window. Any approval prompt the chat client adds would not have appeared here.
- Tool definitions are rendered per user. Several carry my own user ID in the description text, and one says "Semantic search is available for this user." Your snapshot will differ in those details. Appendix A is mine.
- One thing I should have done and didn't: as workspace owner I can read the installed app's scopes in Slack's admin pages under Manage apps. That would settle the token-type question below. I didn't check, so the token type below stays inferred.

## TL;DR, forward this to your security team

- The connector exposes twenty tools. Thirteen read. Seven write: send a message, draft one, schedule one, create a channel or DM, create a canvas, edit a canvas, and add a reaction. One read tool, `slack_list_unreads`, appeared after my October 14 snapshot. **Tested** (Appendix A).
- It reads DMs. One search call returned my direct messages with two bots, with participants, timestamps, and permalinks. **Tested.**
- The line between public and private search is a sentence in a tool description asking the model to get consent. It is not a permission. My private search ran with no prompt on the surface I used. **Tested.**
- It very likely acts as the user, not as a bot. Five tool descriptions embed my user ID and the send tool tells the model to use it to message me. No token or scope was observed. **Inferred, untested.**
- It can send and schedule messages. It cannot edit or delete a message. It can delete and replace sections of a canvas. **Stated.**
- Anthropic's docs page describes a connector that searches. The live connector also writes. **Tested** against the page on October 14 and October 29.

## why this matters

Slack is where companies say what they won't write down. Deal chatter, people issues, incident blame, the DM that starts with "between us."

A connector that reads Slack reads that. A connector that writes to Slack speaks as your employee, in a place where colleagues trust the name on the message.

So the two questions are simple. What can it see, and who does it sound like when it talks.

## what the connector can see

**Tested.** `slack_read_user_profile` on myself returned name, email, timezone, workspace name, and two flags: `Admin: Yes` and `Owner: Yes`. The connector knows what role it's running under.

`slack_search_channels` returned four public channels with IDs, creator, and creation date. An empty `keywords` field failed with `execution_failed: parameter_validation_failed`; a one-letter query worked. The definition's `channel_types` defaults to `public_channel` and accepts `private_channel`.

`slack_read_channel` returned channel history. Each message header carried the sender's display name, email address, user ID, and timestamp. Email addresses ride along on every message, not just on profile lookups. Passing my own user ID as the channel opened my self-DM; the definition says "use a user_id as channel_id" to read DM history.

`slack_list_channel_members` returned members with full profiles, email included, by default. Flags add deactivated users and bots.

`slack_search_public_and_private` is where it gets real. With `channel_types` set to `im,mpim` I got five DM messages back. Each result named both participants with user IDs, the sender, the time, and a permalink into the workspace. Bot messages came back with `include_bots: true`. With `content_types: files` it found a canvas and an image. `slack_read_canvas` returned the canvas as full markdown plus a map of section IDs. `slack_read_file` on a PNG returned the image itself, which the model can see.

**Stated**, and easy to miss: both search tools default `only_my_channels` to false. Search reaches public channels the user never joined.

## the consent line is a sentence, not a control

**Tested.** The definition of `slack_search_public` carries this text: "`slack_search_public` does NOT generally require user consent for use, whereas you should request and wait for user consent to use `slack_search_public_and_private`." The private search tool's own definition says nothing about consent at all.

That's an instruction to the model, placed on the tool it doesn't apply to. Nothing enforced it in my test. I called the private search directly and got DMs back on the first try. No approval screen appeared on my surface.

It isn't the only guardrail of this kind. **Stated:** `slack_create_conversation` says to use it "only if the user allows it." `slack_send_message` says to use the draft tool instead "if user has not reviewed the message." Same pattern: the safety rule lives in a sentence the model is asked to follow.

If your threat model relies on "Claude only searches public channels unless the user agrees," you're relying on the model following a sentence. A prompt injection, a confused agent, or a model having a bad day can skip it. Whether the claude.ai chat client adds a real approval step on top is the question to put to Anthropic. I couldn't see one from where I tested.

## what it can write

**Stated.** I did not run any write tool. The definitions allow:

- `slack_send_message`: post to any channel or DM the user can post in, including thread replies with an option to broadcast to the channel. 5,000 characters per text element. "Cannot post to externally shared (Slack Connect) channels."
- `slack_send_message_draft`: save to the user's "Drafts & Sent" without sending. Requires channel membership (`not_in_channel` otherwise). Send has no such stated check.
- `slack_schedule_message`: deliver 2 minutes to 120 days later. "Once scheduled, cannot be edited via API." The definition notes scheduled messages can be found in Slack's Drafts & Sent, so a person can still cancel one there.
- `slack_create_conversation`: public or private channel, DM, or group DM; invite up to 1,000 users. Errors include `restricted_action`, which means Slack admin restrictions on channel creation still apply.
- `slack_create_canvas` and `slack_update_canvas`: write canvases. Update supports `append`, `prepend`, `replace`, and `delete` on sections, up to 100 operations in one call. Replace and delete are destructive edits to an existing document. Canvas writes strip `javascript:` and `data:` link schemes.
- `slack_add_reaction`: react to any message. No tool removes one.

On identity: five tool descriptions embed my user ID, and the send tool tells the model to use it to message myself. That points to a user token, which would mean a message sent through the connector appears as me. I didn't send one and didn't check the app's scopes, so I can't say whether Slack marks it as coming from an app. **Inferred.** The scope check in the scope section above would settle it.

## what it refuses

**Tested.** A made-up channel ID returned `channel_not_found`. The error text says the channel "may not exist, may be in a different workspace than your app is installed on, or your app may lack permission to access it." It doesn't tell you which. That's the right behavior.

**Stated.** No tool deletes a message. No tool edits one. No tool leaves or archives a channel or removes someone from one.

Put those together. The connector can schedule a message four months out and create a channel with a thousand people in it. Nothing in the connector takes either back. A person has to clean up in Slack.

That's the same shape I found in [the Drive connector](/writing/claude-drive-connector/): it can grant, it can't revoke.

## the read-then-write chain

**Stated.** The definition of `slack_read_file` wraps returned content in randomized tags and warns the model that the content is untrusted. Anthropic treats what the connector reads as a prompt-injection surface, and says so in the tool itself.

Now put that next to `slack_send_message`. A poisoned message or file in a channel the user never joined (search reaches those by default) is read by the model, which then has a tool that posts as the user, with the only guard being a sentence asking it to draft first. That is the highest-severity scenario this connector enables, and it needs no admin misconfiguration. I didn't attempt it. It's the first thing I'd ask Anthropic to show mitigations for.

## where the docs and the behavior disagree

**Tested** against the page at claude.com/docs/connectors/slack on October 14 and October 29, 2026. Verbatim: "the Slack connector lets Claude in claude.ai search your workspace's channels, direct messages, and files for context." Under its own heading, "Search Slack with the connector," it says Claude "can search your workspace's channels, direct messages, and files to answer your questions." That is the whole capability description.

The live connector has seven write tools, including scheduled sends and channel creation.

The page says the connector "is available on Team and Enterprise plans and requires the app to be installed first." A Claude bot user was a member of one of my channels, which fits the second part. It carries a banner: "This page covers the earlier per-user Claude in Slack app. The current product is Claude Tag." The connector section underneath doesn't say whether it was updated too. A reviewer reading it would approve a search tool. They'd be getting a send tool.

## what an admin can change

**Stated.** Two controls are documented. A Claude Owner enables or disables the Slack connector for the whole organization at Organization settings, Connectors. A Slack admin approves the Claude app for the workspace before anyone can connect. Both are on/off. Neither is documented as separating reads from writes.

**Untested**, because my workspace has no second human and no private channels:

- Whether the connector reaches private channels the user isn't a member of.
- Whether an owner's token sees more than a member's.
- Whether a Slack admin can limit the connector to public channels, or block DMs.
- Whether a Claude org owner can turn off the write tools and leave search on.
- The OAuth scopes requested. See the scope section; this one is fixable.
- Slack Connect channels. Send and schedule say they can't post there. I didn't verify reads.
- Enterprise Grid behavior across workspaces.

## where the data goes

Not covered by this teardown. The docs page says disconnecting "deletes past conversations within 30 days" for the Claude in Slack app, and that "your workspace's Slack retention policies apply to the messages in Slack." Neither statement is about what happens to DM content the connector pulled into a claude.ai chat. The general connector terms [I verified in June for the Google connectors](/writing/claude-gmail-connector-data/) (no training on connector data on any plan; content retained with the chat) should apply here too, but I haven't confirmed Anthropic says so for Slack specifically. Ask.

## what to ask before you approve it

1. What Slack scopes does the connector request, and is it a user token or a bot token?
2. Is the "ask before private search" rule enforced anywhere outside the model's instructions, such as an approval step in the chat client? Does that step exist in Cowork, Claude Code, and the API?
3. Can an org owner disable `slack_send_message`, `slack_schedule_message`, and `slack_create_conversation` while keeping search?
4. Do messages sent through the connector carry any marker in Slack that they came from Claude?
5. Does an admin or owner token reach private channels the user isn't in?
6. Are DMs and files fetched through search covered by the same retention and training terms as other connector data?
7. What mitigations exist for the read-then-write chain: content read from a channel the user never joined, followed by a post as the user?
8. Does the connector show up in Slack's audit logs (Grid) or Anthropic's compliance API, and what does each record?
9. Why does the docs page describe search only, and does the "earlier per-user app" banner apply to the connector section?

## the bottom line

The read side reaches DMs, and public channels the user never joined, and is guarded by a polite request to the model. That's not a control a security team can audit.

The write side lets the model speak, very probably as your employee, on a delay of up to 120 days, with no undo inside the connector.

Before you approve anything: get the scope list from Slack's Manage apps page, and get Anthropic's answer on whether writes can be switched off separately from search. If writes can't be separated, the question isn't "approve the connector," it's "approve your staff posting to Slack through a model." Then test it in a workspace with more than one human in it. I couldn't, and that's the gap.

---

## appendix A: the twenty tools, as defined on October 29, 2026

Read (13)

- `slack_get_reactions`: reactors' names and IDs on a message, up to 50 per emoji.
- `slack_list_channel_members`: full profiles by default; 30 per page; bots and deactivated users excluded unless flagged; no DMs.
- `slack_list_unreads`: the calling user's conversations with unread messages, DMs and group DMs with the user's VIPs ranked first; returns channel IDs, unread mention counts, last-read timestamps, and permalinks, no message text; muted conversations excluded unless flagged. Its description points to a `slack_list_activity` tool that isn't in my tool list.
- `slack_read_canvas`: full markdown, section IDs, unresolved comment threads.
- `slack_read_channel`: history; a user ID as `channel_id` reads DM history; 1 to 100 messages per page with time bounds.
- `slack_read_file`: text or base64 binary; 10 MB cap; returns canvases, Slackbot reports, and dashboards with their data; content wrapped and flagged as untrusted.
- `slack_read_thread`: up to 1,000 messages per page.
- `slack_read_user_profile`: contact info, timezone, org, role; defaults to the caller.
- `slack_search_channels`: `channel_types` default `public_channel`, accepts `private_channel`; `include_archived`; 20 per page.
- `slack_search_emojis`: custom emoji names, up to 200.
- `slack_search_public`: public channels only; `only_my_channels` default false; `include_bots` default false; `content_types` messages and files; carries the consent sentence; embeds the caller's user ID.
- `slack_search_public_and_private`: `channel_types` default `public_channel,private_channel,mpim,im`; no consent language in its own description; same filters.
- `slack_search_users`: by name, email, title, department; 20 per page; embeds the caller's user ID.

Write (7)

- `slack_add_reaction`: any message; no remove tool.
- `slack_create_canvas`: from markdown; "Not available on free teams"; strips `javascript:`, `data:`, `file:` links.
- `slack_create_conversation`: channel, DM, or group DM; up to 1,000 invites; "only if the user allows it" in the description; `restricted_action` and `too_many_users` errors.
- `slack_schedule_message`: 2 minutes to 120 days; not editable via API once scheduled; no Slack Connect.
- `slack_send_message`: any channel or user ID; 5,000 characters per text element; thread and broadcast options; "use draft if user has not reviewed"; no Slack Connect.
- `slack_send_message_draft`: user's Drafts & Sent; requires channel membership; one draft per channel.
- `slack_update_canvas`: up to 100 operations; `append`, `prepend`, `replace`, `delete` on sections.

## appendix B: what changed in this version

- Added `slack_list_unreads`; tool count is now twenty.
- Corrected: the consent sentence is in `slack_search_public`'s definition only, not both search tools.
- Corrected: the user ID appears in tool descriptions, not in results. "Acts as the user" is now labeled inferred, with the Slack admin scope check named as the way to settle it.
- Corrected: "cannot edit or delete" now says messages; canvas sections can be deleted and replaced.
- Docs quotes are now verbatim with a retrieval date.
- Added: `only_my_channels` default, the other model-level guardrails, `restricted_action`, the read-then-write chain, the two documented admin controls, data handling, audit logging.
- Added the scope statement and the tested / stated / inferred / untested labels.
