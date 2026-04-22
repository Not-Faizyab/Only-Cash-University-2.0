# Only Cash University

## Only Cash University

Only Cash University is a full frontend implementation of a subscription-based video platform built for a client. The goal was to replicate a Netflix-style user experience while integrating business logic like gated content and an affiliate system.

This is a structured, multi-page platform with real user flow in mind.

## What this actually is

This project is a real-world SaaS product where:

* Users browse a catalog of video content
* Content access is restricted based on subscription status
* UI mimics modern streaming platforms (content rows, previews, navigation patterns)
* Affiliate logic is integrated into the flow (referrals, tracking concepts and commissions)

Everything here is built using vanilla HTML, CSS, and JavaScript, no frameworks.

## Core Features

### Content Platform UI

* Horizontally scrollable content sections
* Categorized video libraries
* Thumbnail-based navigation similar to streaming apps
* Structured layout for scaling content

### Subscription-Gated Experience

* UI states that simulate locked/unlocked content
* Conditional rendering logic in JS
* Designed to plug into a real backend/payments system

### Affiliate System

* Referral-based entry points
* Logic for tracking user origin
* Designed with scalability in mind for backend integration

### Multi-Page Architecture

* Separated pages instead of a single static file
* Navigation flows that mimic real product usage
* Better maintainability

### Responsive Design

* Built to adapt across devices
* Focus on usability, not just shrinking elements

## Tech Stack (and why)

* HTML → Structured pages instead of component frameworks
* CSS → Custom styling, layout control
* Vanilla JavaScript → Full control over logic without abstraction

No frameworks were used intentionally, this keeps the project lightweight and demonstrates core frontend fundamentals.

## Important context

This was built for a client, so:

* Backend (auth, payments, database) is NOT included
* Some logic is simulated at frontend level
* The structure is intentionally prepared for real integration

## What makes this project different

This project actually considers:

* User flow
* Monetization logic (subscriptions + affiliates)
* Scalability of content
* Separation of concerns across files/pages

## If you’re looking at this repo

Don’t expect a plug-and-play SaaS.

This is a frontend system designed to be connected to a real backend, not a complete production deployment.
