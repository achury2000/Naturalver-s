# Spec Delta

## Purpose

The home page hero carousel is content-managed: a Payload global defines banner slides (title, copy, images, button, social links, active state) that the storefront renders as a responsive, accessible rotating carousel. Editing banners does not require code deploys.

## ADDED Requirements

### Requirement: CMS exposes an editable home banner global
The system SHALL expose the home page hero banners and site social links as a single CMS-managed global content object, served over the public REST API and editable in the admin panel.

#### Scenario: Banners are editable in the admin
- **WHEN** an authenticated admin opens the CMS admin
- **THEN** a "Banners de inicio" section is available to edit slides and social links
- **AND** saving persists the changes

#### Scenario: Banners are readable via REST by anyone
- **WHEN** an unauthenticated GET request is made to `/api/globals/home-banners?depth=1`
- **THEN** the request returns 200 with the global object, including its `slides` and `socialLinks`

#### Scenario: Social links are part of the global
- **WHEN** the global is read
- **THEN** it includes optional `instagram`, `facebook` and `tiktok` social link values

### Requirement: Banner slides carry complete, validated content
Each banner slide SHALL define a type, a required title, an optional description, a required desktop image and a required mobile image with descriptive alt text, an optional button label and link, an optional note, an optional toggle to show social links, and an active flag that defaults to true. The global SHALL accept between 1 and 6 slides.

#### Scenario: Required slide fields are enforced
- **WHEN** an admin attempts to save a slide without a title or without one of its images
- **THEN** the save is rejected or flagged as invalid by the CMS
- **AND** the invalid slide is not published

#### Scenario: Storefront falls back to the title for alt text
- **WHEN** a slide image is rendered with no alt text
- **THEN** the storefront uses the slide title as the fallback alt text

#### Scenario: Slide count is bounded
- **WHEN** an admin adds more than 6 slides
- **THEN** the CMS prevents or flags the extra slides

### Requirement: The storefront renders only active slides
The public home page SHALL render every slide whose active flag is true and nothing else, in the order defined in the global.

#### Scenario: Inactive slides are hidden
- **WHEN** a banner slide has its active flag set to false
- **THEN** that slide is not rendered on the public home page
- **AND** other active slides still render

#### Scenario: No active slides leaves a clean home page
- **WHEN** no slide has the active flag set to true
- **THEN** the home page renders without a carousel and without errors

### Requirement: The carousel is accessible and pauses autoplay
The carousel SHALL be operable by keyboard, expose visible navigation (arrows, dots) with accessible labels, and SHALL pause automatic rotation while the user is hovering or focused on it and SHALL not autoplay at all when the user prefers reduced motion.

#### Scenario: Keyboard navigation works
- **WHEN** a keyboard-only user focuses the carousel and presses its navigation controls
- **THEN** the slides change as expected without requiring a mouse

#### Scenario: Autoplay respects hover, focus and reduced motion
- **WHEN** the pointer hovers over the carousel or a control receives focus
- **THEN** automatic rotation pauses and resumes when the pointer/control leaves
- **AND** when the user has `prefers-reduced-motion` enabled, the carousel never rotates automatically

### Requirement: Banner images are responsive and efficiently loaded
The storefront SHALL render a desktop-sized image on large screens and a mobile-optimized image on small screens, prioritizing the first slide's image and deferring the rest.

#### Scenario: Breakpoint-appropriate image is served
- **WHEN** the home page is viewed on a desktop viewport
- **THEN** the desktop image of each slide is displayed
- **AND** when viewed on a mobile viewport, the mobile image is displayed instead

#### Scenario: First image prioritized, others lazy
- **WHEN** the home page loads
- **THEN** the first slide's image is loaded with priority
- **AND** subsequent slides' images are loaded lazily