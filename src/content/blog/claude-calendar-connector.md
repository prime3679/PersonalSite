---
title: "What Claude's Google Calendar connector actually does"
shortTitle: "Claude's Google Calendar connector"
date: 2026-10-29
tags: ["ai"]
description: "A tested teardown of Claude's Google Calendar connector: it returns every event whole, ignores private, and can create, change, and delete events that one of Anthropic's pages still calls read-only."
published: true
---

Tested October 15, 2026, against the live connector on my personal Google calendar. Re-checked against the live tool definitions and Anthropic's documentation on October 29, 2026. Every claim below is marked **tested** (a call I made and a response I saw), **stated** (what the tool definition or Anthropic's docs say, not exercised), or **untested**.

## scope, so you can reproduce it

- Account: a personal Google account, not Workspace, and a different one from the account my Drive and Gmail connectors use.
- Claude plan: personal Max (the 5x tier). Anthropic's docs page says Calendar is on Pro, Max, Team, and Enterprise.
- Surface: Claude running as an agent (Cowork), calling tools directly. Not the claude.ai chat window, so any approval prompt the chat client adds wouldn't appear.
- Tool definitions change without notice. Appendix A is the snapshot from October 29.

## TL;DR, forward this to your security team

- Anthropic's docs page says the connector is read-only and "can't create, modify, or delete calendar events" or "send calendar invitations." The live connector has tools for all four. Anthropic's help center, updated this week, matches the tool list. The docs page doesn't.
- It exposes nine tools. Five read. Four write: create, update, delete, and respond to events. Drive's connector can only trash, and Slack's can't delete a message. This one deletes events outright.
- Event descriptions come back in full by default. On my calendar that meant webinar passcodes, receipt numbers, appointment IDs, and health details.
- Events marked `private` come back like any other event.
- Search reached events from 15 months ago on the first query.
- The free/busy tool returned a 33-hour "free" block for a calendar it may not be able to see. It doesn't say which.

## why this matters

A calendar looks like the least sensitive thing you can connect. It's a list of meetings.

In practice it's where people paste what they need at the moment they need it. Dial-in codes. Confirmation numbers. The recruiter's phone number. Why the doctor's appointment is happening. Calendars also fill themselves, from email confirmations and from other tools that write events on your behalf.

So the read side is more sensitive than it looks. The write side matters for a different reason. Calendar invites are email. A tool that can create events with attendees can send mail to anyone.

## what the connector can see

**Tested.** `list_calendars` returned seven calendars: my own, a school calendar, a family calendar, a family member's personal calendar shared with me, a holidays feed, an imported course calendar, and one more group calendar. Each came with its calendar ID, which for personal calendars is the owner's email address.

The tool description adds that calendars shared with you "can be accessed directly by their `calendar_id` (email identifier) without subscribing to them first." So the list isn't the boundary. Anything shared with you is in reach by address.

`list_events` with no arguments returned one event, the next one on my primary calendar. The default window is now plus seven days. The event came back with title, start, end, location, organizer, a link, and the full description. That description held an insurance plan name, a copay, a clinic phone number, and a cancellation fee. None of that was needed to answer "what's next on my calendar."

Anthropic's page says Claude "retrieves the minimum information needed to answer your question." The tool has no way to ask for less. There's no field filter. Every event comes back whole.

Widening the window is one parameter. A six-week range returned ten events. Their descriptions included a Zoom webinar link with the passcode and dial-in, a paid receipt number with a support case number, an appointment ID, and health details for a family member.

Three of those events had `"visibility":"private"`. They came back the same as the rest. `private` hides details from other people who can see your calendar. It does nothing against a tool acting as you.

Two events had `"eventType":"FROM_GMAIL"`. Google creates these from email confirmations. The connector returned their title and location plus a description pointing to the source message with a Gmail link. Calendar is a side door into what's in your inbox.

By default `list_events` skips birthdays and working-location events. Asking for `BIRTHDAY` explicitly returned contacts' birthdays by full name, all marked private.

`search_events` is semantic and covers the primary calendar. A search for "interview" returned three events. The oldest was from July 2025. One description listed the interviewers' names, the recruiter's name, and the recruiter's phone number. There's no date limit on search.

`get_event` with a fake ID returned "The requested event could not be found or has been deleted."

## the free/busy result that lies by omission

**Tested.** `suggest_time` finds open slots across calendars. I asked for a 30-minute slot over two days across two addresses that aren't the connected account: another Google account of mine, and a family member's.

It returned one slot, 1,980 minutes long. That's 9am on day one to 6pm on day two, overnight included. So it ignores working hours unless you pass them.

The bigger problem is what it didn't say. It returned no error and no warning. It can't tell "this person is free" apart from "I can't see this person's calendar," or if it can, it doesn't say so. A model scheduling a meeting from this answer would book into a block it knows nothing about.

## what it can write

**Stated.** I did not run any write tool. Here is what the tool definitions allow.

- `create_event`: create an event on any calendar you can write to, with attendees, a Google Meet link, attachments by URL, a description that "Can contain HTML," custom reminders, recurrence rules, and guest permissions. `notificationLevel` defaults to `ALL`, which means invitation emails go out.
- `update_event`: change time, title, description, location, visibility, reminders, and attachments. Add or remove attendees. Notifications default to `ALL`.
- `delete_event`: delete any event on a calendar you can write to. Notifications default to `ALL`.
- `respond_to_event`: accept, decline, or tentatively accept, with a comment, and notify the organizer. Notifications default to `ALL`.

`create_event` is the one to look at. It's an outbound email channel. The model picks the recipients, writes the description, and attaches links. The invite arrives from your address. The help center says each action needs your approval by default. I didn't see that prompt on the surface I tested. **Stated**, not verified.

`delete_event` is the other. Drive's connector can only trash. Slack's can't delete a message, though it can delete canvas sections. This one deletes events outright, and by default tells every attendee.

## where the docs and the behavior disagree

**Tested** against both pages on October 29, 2026. Anthropic's two pages disagree with each other, and only one matches the tool list.

The docs page at claude.com/docs/connectors/google/calendar says "Claude reads your calendar only; it can't create or change events or send invitations," "The connector is read-only," "Claude can't create, modify, or delete calendar events," and "Claude can't send calendar invitations."

The help center article "Use Google Workspace connectors," updated the week of October 26, says Claude can "Create, update, and delete events with full customization," "Manage attendee lists and respond to invitations," and "Set up recurring meetings." It adds: "By default, each action Claude takes on your behalf requires your explicit approval."

The live tool list has `create_event`, `update_event`, `delete_event`, and `respond_to_event`, and all four notify by default. The help center is right. A reviewer who reads only the docs page would approve a read-only connector. They'd be approving one that can delete meetings and send invitations from an employee's address.

## other things I noticed

This connector was signed in to a different Google account than my Drive and Gmail connectors. Each connector authenticates on its own. Nothing ties them to one identity. In a company, that means an employee can connect a personal calendar to a work Claude account, or the reverse, and nothing flags it.

Some events on my calendar were written by other AI tools. One description said it was "Automatically generated." Calendar is a shared surface that other agents write to. Whatever they write, Claude reads as plain content.

## what an admin can change

**Untested** on a personal account:

- Whether a Workspace admin can restrict the connector to the primary calendar.
- Whether a Claude org owner can disable the write tools.
- Whether an approval prompt appears before a write in the chat client.
- The OAuth scope requested. I didn't see the consent screen.
- Whether `suggest_time` distinguishes free from not visible when the other calendar is in the same Workspace domain.

The docs page says Team and Enterprise owners must enable the connector before members can connect. That's the only admin control it names.

## where the data goes

Re-checked against the help center on October 29, 2026: Anthropic says it does not train on Calendar connector data, and retrieved data is retained with the chat it was pulled into. [My Gmail piece](/writing/claude-gmail-connector-data/) covers what that means plan by plan. Nothing I found says whether `private` events get any different handling. Ask.

## what to ask before you approve it

1. Why does the docs page say read-only when the connector has create, update, delete, and respond?
2. Can an org owner disable the write tools and keep reads?
3. Is there an approval step before an invite is sent, enforced outside the model?
4. Can `create_event` invite external addresses? Can an admin block that?
5. What OAuth scope does it request: `calendar.readonly` or full `calendar`?
6. Can the connector be limited to titles and times, without descriptions?
7. How does `suggest_time` report a calendar it can't see?
8. Can an admin require the connected Google account to match the user's work identity?

## the bottom line

The read side returns more than it needs to, every time, and ignores `private`. If your people paste codes and confirmation numbers into calendar descriptions, and they do, the connector reads those too.

The write side contradicts Anthropic's own docs page. It can delete meetings and send invitations as the user, with notifications on by default.

I'm not going to tell you to approve it. This was one personal account on one surface, with the approval gate unobserved. Verify three things first: whether an owner can switch off the write tools and keep reads, whether the approval step is enforced somewhere a model can't skip, and what OAuth scope it requests. Then ask Anthropic which of its two pages is current.

---

## appendix A: the nine tools, as defined on October 29, 2026

Read (5)

- `list_calendars`: calendars the user owns or subscribes to; says others shared with the user are reachable by `calendar_id` without subscribing.
- `list_events`: one calendar, primary by default; window defaults to now plus 7 days; default types are regular, out-of-office, focus time, and from-Gmail; `fullText` matches title, description, location, attendees; page size 100 by default, 250 max.
- `search_events`: semantic search over the primary calendar; no date bounds.
- `get_event`: one event by ID.
- `suggest_time`: free slots across attendee emails; 30 minutes and 5 slots by default; working hours and weekends only if passed.

Write (4)

- `create_event`: attendees, Meet link, attachments by URL, description that "Can contain HTML," recurrence, reminders, guest permissions, visibility; `notificationLevel` defaults to `ALL`.
- `update_event`: any field, add or remove attendees and attachments; defaults to `ALL`.
- `delete_event`: by event ID; defaults to `ALL`.
- `respond_to_event`: accept, decline, or tentative, with a comment; defaults to `ALL`.

## appendix B: what changed in this version

- Added the scope statement and the tested / stated / untested labels.
- Rewrote the docs section: the help center now lists the write tools, the docs page still says read-only.
- Corrected: all four write tools notify by default, not three.
- Corrected the Slack comparison: Slack can delete canvas sections.
- Added the data section and the tool appendix. Replaced the verdict with what to verify first.
