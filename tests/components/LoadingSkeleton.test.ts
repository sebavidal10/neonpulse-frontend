import { describe, it, expect } from 'vitest';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../../src/components/LoadingSkeleton/LoadingSkeleton';

describe('LoadingSkeleton Component', () => {
  it('debe crear un elemento skeleton loader para el banner', () => {
    const el = createBannerSkeletonElement();
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.className).toContain('animate-pulse');
  });

  it('debe crear un DocumentFragment con el número por defecto de esqueletos para la grilla', () => {
    const fragment = createGridSkeletonElement();
    expect(fragment).toBeInstanceOf(DocumentFragment);
    expect(fragment.childNodes.length).toBe(3);
  });

  it('debe crear el número exacto de esqueletos solicitado', () => {
    const fragment = createGridSkeletonElement(5);
    expect(fragment.childNodes.length).toBe(5);
  });
});
