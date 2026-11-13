---
title: "Content item contract"
description: "What a content item carries: row number, fingerprint, rules of engagement, and thread identity."
weight: 2
---

A content item is what the owning service persists for one queued post, and what `blowhorn content list`, `content get`, and `content posts` read back. This page is the contract the generated code references: the TypeScript `ContentItem` type, the `ContentThread` schema, and the CLI reference all point here, so a change to the item's shape starts here.

## Row number and fingerprint

Each item carries a row number, unique across the live content items of the organization, assigned by the server on insert. Each item also carries a fingerprint: a hex digest the server computes over the item's canonical values (`data`, `profile`, `rowNumber` and, when set, `rulesOfEngagement` and `mediaAssetIds`), typed so null, empty string, zero, and false differ. An item without those fields hashes exactly as it did before they existed.

Updates are conditional on the fingerprint the writer read: `content upsert --activity N --expected-fingerprint <fingerprint>` is refused when the fingerprint no longer matches, so a stale write is refused rather than silently applied.

## Rules of engagement

An item may carry its own rules of engagement, which can only tighten.

## Threads

A thread is one chain of content items under one root: the root, then its replies in order. Threads do not nest, and deleting an item leaves the references to it in place. A reply names its parent by item id, which no column holds: the thread identity sits beside the item's values, not in them.

- The root carries no thread fields at all. It is the `threadId` its replies name, and it counts as position 0.
- A reply names the root item as `threadId`, the item it answers directly as `replyToId`, and its position from 1 as `threadIndex`.
- The three fields are set on insert only. They are not part of the fingerprint.

Writing a chain:

- Upsert accepts a thread identity on create only (`blowhorn content upsert --thread-id <root id> --reply-to-id <parent id> --thread-index <n>`). `threadIndex` is required exactly when `threadId` is given and is at least 1; `replyToId` requires `threadId`.
- A field named in both spellings (`threadId` and `thread_id`, and the same for the other two) with different values is refused too, so a caller typo cannot silently win; the same value in both spellings is accepted.
- An update carrying thread fields is refused unless they equal what is already stored.
- A chain is written root first: the root's upsert returns the id its replies name as `threadId`.

Reading a chain:

- `content list`, `content get`, and `content posts` JSON carry a `thread` key beside `values` (`item_id`, `thread_id`, `reply_to_id`, `thread_index`; the last three are null on an item that carries no thread). A payload from a backend that does not project the fields yet omits the `thread` key, and the item then reads as a standalone item. A job names no post, so `schedule list` is unchanged.
- When the desktop reads items back, it checks only `id`, `profile`, `rowNumber`, `fingerprint`, and `data`, and allows every other field.
- The desktop Activity screen groups each thread under its root: an indented chain with a `thread · N` line, expand and collapse, and the whole chain in the open post's editor. A standalone item with no id keys its group by activity number, so empty ids never collapse rows into one group.

## The Cloud gate

Cloud does not serve the thread fields yet. Until it lands, no live insert carries them: the caller that writes a chain is the desktop radio net Deploy, which stays disabled until then. The fake store round-trips the fields, so the write and read paths are exercised hermetically, and the test fake refuses a thread-field change on update with a 409, as production refuses it.

Two rules stand whatever Cloud serves:

- A thread part's link is recorded only once read back. The parent relation never stands in for a link.
- Hacker News never joins a coordinated thread. X and Bluesky split one activity's text at post time, so a split thread's parts are not separate content items and carry no thread fields.
