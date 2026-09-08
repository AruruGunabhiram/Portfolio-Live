/**
 * A19 — decorative closing visuals, kept out of the initial bundle.
 *
 * Leadership and Contact both reach these through React.lazy, so Vite emits a
 * single shared chunk for the pair rather than shipping either SVG eagerly.
 * Both are purely decorative: their sections render correctly without them.
 */
export { LeadershipOutreachVisual } from '../leadership/LeadershipOutreachVisual';
export { ContactSendVisual } from '../contact/ContactSendVisual';
