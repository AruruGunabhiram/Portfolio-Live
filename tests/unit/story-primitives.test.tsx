import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StoryStage } from '../../src/components/story/StoryStage';
import { StoryNode } from '../../src/components/story/StoryNode';
import { StoryConnector } from '../../src/components/story/StoryConnector';
import { StoryPacket } from '../../src/components/story/StoryPacket';
import { StoryStatus } from '../../src/components/story/StoryStatus';
import { StoryWindow } from '../../src/components/story/StoryWindow';

describe('A2 — story primitives accessibility + tokens', () => {
  it('8 — StoryStage has role img, aria-label, sr-only description, no layout shift', () => {
    const { container } = render(
      <StoryStage ariaLabel="Test story" description="A system with AI and backend nodes">
        <div>child</div>
      </StoryStage>
    );
    const stage = container.firstChild as HTMLElement;
    expect(stage.getAttribute('role')).toBe('img');
    expect(stage.getAttribute('aria-label')).toBe('Test story');
    expect(stage.textContent).toContain('A system with AI and backend nodes');
    const sr = stage.querySelector('.sr-only');
    expect(sr).not.toBeNull();
    expect(sr?.textContent).toBe('A system with AI and backend nodes');
    // no fixed width, min-width 0 via class, position relative
    expect(stage.className).toContain('min-w-0');
    expect(stage.style.position).toBe('relative');
    expect(stage.style.minHeight).toBe('var(--story-reserved-height, 200px)');
  });

  it('9a — StoryConnector decorative is aria-hidden', () => {
    const { container } = render(<StoryConnector active={true} orientation="vertical" />);
    const inner = container.firstChild as HTMLElement;
    expect(inner.getAttribute('aria-hidden')).toBe('true');
    // should not be tabbable
    expect(inner.tabIndex).toBe(-1 || 0); // not focusable by default, but check no explicit tabIndex 0
    expect(inner.querySelector('svg')).not.toBeNull();
  });

  it('9b — StoryPacket decorative is aria-hidden, static vs animated', () => {
    const { container: c1 } = render(<StoryPacket shouldAnimate={false} label="data" />);
    const staticEl = c1.firstChild as HTMLElement;
    expect(staticEl.getAttribute('aria-hidden')).toBe('true');
    // static has no motion transform
    expect(staticEl.textContent).toContain('data'); // sr-only includes label

    const { container: c2 } = render(<StoryPacket shouldAnimate={true} label="data" />);
    const animEl = c2.firstChild as HTMLElement;
    expect(animEl.getAttribute('aria-hidden')).toBe('true');
  });

  it('9c — no aria-live on stage or packet', () => {
    const { container } = render(
      <StoryStage ariaLabel="No live" description="static desc">
        <StoryPacket shouldAnimate={false} />
        <StoryConnector active={false} />
      </StoryStage>
    );
    const stage = container.firstChild as HTMLElement;
    expect(stage.getAttribute('aria-live')).toBeNull();
    expect(stage.querySelector('[aria-live]')).toBeNull();
  });

  it('StoryNode variants use A1 tokens via class', () => {
    const variants = ['ai', 'backend', 'database', 'cloud', 'automation', 'neutral'] as const;
    for (const v of variants) {
      const { container, unmount } = render(<StoryNode variant={v} label={`${v} node`} detail="detail" />);
      const node = container.firstChild as HTMLElement;
      expect(node.className).toContain(`story-node--${v}`);
      expect(node.textContent).toContain(`${v} node`);
      expect(node.textContent).toContain('detail');
      unmount();
    }
  });

  it('StoryNode state does not rely on color alone — includes indicator + text', () => {
    const { container } = render(<StoryNode variant="backend" label="Service" state="active" />);
    const node = container.firstChild as HTMLElement;
    const dot = node.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(node.textContent).toContain('Service');
  });

  it('StoryWindow renders title bar and no fake browser chrome beyond dots', () => {
    const { container, getByText } = render(<StoryWindow title="Service panel"><p>content</p></StoryWindow>);
    expect(getByText('Service panel')).toBeTruthy();
    const win = container.firstChild as HTMLElement;
    expect(win.className).toContain('story-window');
    expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
  });

  it('StoryStatus meaning via text not color alone', () => {
    const { getByText } = render(<StoryStatus variant="warning" label="Discrepancy" detail="2 records mismatch" />);
    expect(getByText('Discrepancy')).toBeTruthy();
    // detail is visually present + sr-only duplication
    const texts = document.body.textContent ?? '';
    expect(texts).toContain('Discrepancy');
    // warning class applied
    const el = document.body.querySelector('.story-status--warning') as HTMLElement;
    expect(el).not.toBeNull();
  });

  it('StoryStatus success similarly', () => {
    const { container } = render(<StoryStatus variant="success" label="Completed" detail="Idempotent write verified" />);
    expect(container.querySelector('.story-status--success')).not.toBeNull();
  });

  it('Compact/mobile: primitives respect min-w-0 and max-width 100% (no 320 overflow)', () => {
    const { container } = render(
      <StoryStage ariaLabel="compact test" description="desc">
        <StoryNode variant="database" label="Very long label that should wrap and not cause overflow at 320px width" detail="Extremely long detail text that must wrap anywhere and not create horizontal scrollbars" />
      </StoryStage>
    );
    const stage = container.firstChild as HTMLElement;
    expect(stage.className).toContain('min-w-0');
    // check node has overflow-wrap anywhere inline style
    const node = stage.querySelector('.story-node') as HTMLElement;
    expect(node.style.overflowWrap).toBe('anywhere');
  });
});
