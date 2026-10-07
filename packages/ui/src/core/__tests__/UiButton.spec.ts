import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UiButton from '../UiButton.vue';

describe('UiButton', () => {
  it('renders a button of type "button" with the primary variant by default', () => {
    const wrapper = mount(UiButton, { props: { label: 'Save' } });

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.text()).toBe('Save');
    expect(wrapper.classes()).toContain('bg-primary');
  });

  it('prefers the slot over the label', () => {
    const wrapper = mount(UiButton, { props: { label: 'Save' }, slots: { default: 'Send' } });

    expect(wrapper.text()).toBe('Send');
  });

  it('applies the variant, size, and block classes', () => {
    const wrapper = mount(UiButton, { props: { variant: 'danger', size: 'lg', block: true } });

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['bg-red-600', 'px-8', 'w-full']));
    expect(wrapper.classes()).not.toContain('bg-primary');
  });

  it('renders a link when href is set, without button-only attributes', () => {
    const wrapper = mount(UiButton, { props: { href: '/login', label: 'Login' } });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/login');
    expect(wrapper.attributes('type')).toBeUndefined();
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });

  it('disables the button and marks it busy while loading', () => {
    const wrapper = mount(UiButton, { props: { loading: true } });

    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });

  it('marks a disabled link with aria-disabled, since a link has no disabled attribute', () => {
    const wrapper = mount(UiButton, { props: { href: '/login', disabled: true } });

    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });
});
