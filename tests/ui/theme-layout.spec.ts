import { expect, test } from 'playwright/test';

const expectedLightTheme = {
  '--color-background': '#f5f5f7',
  '--color-surface': '#fff',
  '--color-text': '#1d1d1f',
  '--color-primary': '#06c',
  '--color-secondary': '#637f99',
  '--color-accent': '#e1eaf2',
  '--color-border': '#d0d0d0',
  '--font-heading': '"Manrope", sans-serif',
  '--font-body': '"Inter", sans-serif',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#snapshot h1')).toBeVisible();
});

test('central theme tokens and rendered colors stay in sync', async ({
  page,
}) => {
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return [
      '--color-background',
      '--color-surface',
      '--color-text',
      '--color-primary',
      '--color-secondary',
      '--color-accent',
      '--color-border',
      '--font-heading',
      '--font-body',
    ].map((name) => [name, root.getPropertyValue(name).trim()]);
  });
  expect(Object.fromEntries(tokens)).toEqual(expectedLightTheme);

  const renderedColors = await page.evaluate(() => {
    const css = getComputedStyle(document.body);
    const card = document.querySelector<HTMLElement>('.education-scan-card')!;
    const primaryButton = document.querySelector<HTMLElement>('.btn-primary')!;
    return {
      pageBackground: css.backgroundColor,
      cardBackground: getComputedStyle(card).backgroundColor,
      buttonBackground: getComputedStyle(primaryButton).backgroundColor,
      textColor: css.color,
    };
  });
  expect(renderedColors).toEqual({
    pageBackground: 'rgb(245, 245, 247)',
    cardBackground: 'rgb(255, 255, 255)',
    buttonBackground: 'rgb(0, 102, 204)',
    textColor: 'rgb(29, 29, 31)',
  });
});

test('headings, body copy, and controls use the configured font stacks', async ({
  page,
}) => {
  const typography = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const headingToken = root
      .getPropertyValue('--font-heading')
      .trim()
      .replaceAll('"', '');
    const bodyToken = root
      .getPropertyValue('--font-body')
      .trim()
      .replaceAll('"', '');
    const heading = getComputedStyle(document.querySelector('h1')!).fontFamily;
    const paragraph = getComputedStyle(
      document.querySelector('.scan-hero-lede')!,
    ).fontFamily;
    const button = getComputedStyle(document.querySelector('.btn')!).fontFamily;
    const visibleText = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter(
        (element) =>
          element.innerText?.trim() &&
          element.getBoundingClientRect().width > 0,
      )
      .map((element) => getComputedStyle(element).fontFamily);
    return { headingToken, bodyToken, heading, paragraph, button, visibleText };
  });

  expect(typography.headingToken.toLowerCase()).toContain('manrope');
  expect(typography.bodyToken.toLowerCase()).toContain('inter');
  expect(typography.heading.toLowerCase()).toContain('manrope');
  expect(typography.paragraph.toLowerCase()).toContain('inter');
  expect(typography.button.toLowerCase()).toContain('inter');
  expect(typography.visibleText.length).toBeGreaterThan(20);
  expect(
    typography.visibleText.every((family) => /manrope|inter/i.test(family)),
  ).toBe(true);
});

test('text and code color pairs meet WCAG AA contrast in both themes', async ({
  page,
}) => {
  const measureContrast = () =>
    page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const tokens = [
        '--color-background',
        '--color-primary',
        '--color-on-primary',
        '--color-text',
        '--text-secondary',
        '--text-muted',
        '--code-background',
        '--code-text',
      ];
      const colors = Object.fromEntries(
        tokens.map((token) => [token, style.getPropertyValue(token).trim()]),
      );
      const luminance = (hex: string) => {
        const normalized = hex.replace('#', '');
        const rgb =
          normalized.length === 3
            ? normalized
                .split('')
                .map((part) => parseInt(part + part, 16) / 255)
            : [0, 2, 4].map(
                (offset) =>
                  parseInt(normalized.slice(offset, offset + 2), 16) / 255,
              );
        const channels = rgb.map((channel) =>
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
        );
        return (
          channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        );
      };
      const contrast = (foreground: string, background: string) => {
        const first = luminance(foreground);
        const second = luminance(background);
        return (
          (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
        );
      };
      return {
        body: contrast(colors['--color-text'], colors['--color-background']),
        secondary: contrast(
          colors['--text-secondary'],
          colors['--color-background'],
        ),
        muted: contrast(colors['--text-muted'], colors['--color-background']),
        primaryLink: contrast(
          colors['--color-primary'],
          colors['--color-background'],
        ),
        button: contrast(
          colors['--color-on-primary'],
          colors['--color-primary'],
        ),
        code: contrast(colors['--code-text'], colors['--code-background']),
      };
    });

  for (const [role, ratio] of Object.entries(await measureContrast())) {
    expect(ratio, `light theme ${role} contrast`).toBeGreaterThanOrEqual(4.5);
  }

  if (!(await page.locator('.theme-toggle').isVisible())) {
    await page.locator('.menu-toggle').click();
  }
  await page.locator('.theme-toggle').click();
  await expect
    .poll(async () => page.locator('html').getAttribute('class'))
    .toContain('dark-theme');
  for (const [role, ratio] of Object.entries(await measureContrast())) {
    expect(ratio, `dark theme ${role} contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test('article code samples render as readable, scrollable code panels', async ({
  page,
}) => {
  await page.goto('/blog/hashset_internals');
  const codePanel = page.locator('.code-block-wrapper').first();
  await expect(codePanel).toBeVisible();
  await expect(codePanel.locator('.code-block-lang')).toHaveText('java');
  await expect(codePanel.locator('.code-block-copy-btn')).toBeVisible();
  await expect(codePanel.locator('pre')).toBeVisible();
  await expect(codePanel.locator('.linenumber').first()).toBeVisible();

  const panel = await codePanel.evaluate((element) => {
    const style = getComputedStyle(element);
    const code = element.querySelector('pre')!;
    const codeStyle = getComputedStyle(code);
    return {
      background: codeStyle.backgroundColor,
      fontFamily: codeStyle.fontFamily,
      fontSize: parseFloat(codeStyle.fontSize),
      lineHeight: parseFloat(codeStyle.lineHeight),
      overflowX: getComputedStyle(element).overflowX,
      width: element.getBoundingClientRect().width,
      borderRadius: style.borderRadius,
      lineNumbers: element.querySelectorAll('.linenumber').length,
    };
  });
  expect(panel.background).toBe('rgb(23, 33, 43)');
  expect(panel.fontFamily.toLowerCase()).toContain('monospace');
  expect(panel.fontSize).toBeGreaterThanOrEqual(12);
  expect(panel.lineHeight).toBeGreaterThan(panel.fontSize);
  expect(panel.overflowX).toBe('auto');
  expect(panel.width).toBeLessThanOrEqual(
    await page.evaluate(() => innerWidth),
  );
  expect(panel.borderRadius).not.toBe('0px');
  expect(panel.lineNumbers).toBeGreaterThan(0);
});

test('experience, education, and writing pages keep their content within the layout', async ({
  page,
}) => {
  const pages = [
    {
      path: '/experience',
      heading: "Work I've done",
      selector: '.timeline-card-content',
      anchor: '.page-header h1',
    },
    {
      path: '/education',
      heading: 'Education & Skills',
      selector: '.edu-section-title',
      anchor: '.page-header h1',
    },
    {
      path: '/blog',
      heading: 'Engineering Blog',
      selector: '.blog-card',
      anchor: '.page-header h1',
    },
    {
      path: '/blog/hashset_internals',
      heading: 'Why Mutable Objects Break HashSet',
      selector: '.blog-post-content',
      anchor: '.blog-post-title',
    },
  ];

  for (const route of pages) {
    await page.goto(route.path);
    await expect(
      page.getByRole('heading', { name: route.heading }).first(),
    ).toBeVisible();
    await expect(page.locator(route.selector).first()).toBeVisible();
    const layout = await page.evaluate(
      ({ selector, anchor }) => {
        const viewportWidth = document.documentElement.clientWidth;
        const elements = [
          ...document.querySelectorAll<HTMLElement>(selector),
        ].map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          };
        });
        const anchorLeft = document
          .querySelector(anchor)!
          .getBoundingClientRect().left;
        const contentLeft = document
          .querySelector(selector)!
          .getBoundingClientRect().left;
        return {
          viewportWidth,
          pageWidth: document.documentElement.scrollWidth,
          elements,
          alignmentDelta: Math.abs(anchorLeft - contentLeft),
          anchorLeft,
          contentLeft,
        };
      },
      { selector: route.selector, anchor: route.anchor },
    );

    expect(
      layout.pageWidth,
      `${route.path} horizontal page overflow`,
    ).toBeLessThanOrEqual(layout.viewportWidth);
    expect(
      layout.elements.length,
      `${route.path} has visible layout content`,
    ).toBeGreaterThan(0);
    expect(
      layout.alignmentDelta,
      `${route.path} content aligns with its heading (heading ${layout.anchorLeft}px, content ${layout.contentLeft}px)`,
    ).toBeLessThanOrEqual(1);
    for (const element of layout.elements) {
      expect(
        element.left,
        `${route.path} content left edge`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        element.right,
        `${route.path} content right edge`,
      ).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(element.width).toBeGreaterThan(0);
      expect(element.height).toBeGreaterThan(0);
    }
  }
});

test('experience bullets emphasize whole technology and impact phrases cleanly', async ({
  page,
}) => {
  await page.goto('/experience');
  await expect(page.locator('.timeline-details li').first()).toBeVisible();
  const highlighted = await page
    .locator('.timeline-details strong')
    .allTextContents();
  expect(highlighted).toEqual([
    'Java',
    'Spring Boot',
    '120 Peak TPS',
    'p95 latency ~ 100 ms',
    'Python',
    '15+ hours/week',
    'Kafka',
    '1M+ events/day',
    'Azure Cloud',
    '100K articles',
    'React Native',
    'SAP HANA',
    'React Native',
  ]);
  expect(highlighted.some((phrase) => phrase.includes('%'))).toBe(false);
  const highlightStyle = await page
    .locator('.timeline-details strong')
    .first()
    .evaluate((element) => ({
      color: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
    }));
  expect(highlightStyle.color).not.toBe('rgb(0, 102, 204)');
  expect(highlightStyle.background).toBe('rgba(0, 0, 0, 0)');
});

test('skill and topic chips share one treatment and article tags stay concise', async ({
  page,
}) => {
  await page.goto('/education');
  await expect(page.locator('.badge').first()).toBeVisible();
  await expect(page.locator('.skill-pill')).toHaveCount(0);

  await page.goto('/blog');
  const cards = page.locator('.blog-card');
  for (let index = 0; index < (await cards.count()); index += 1) {
    await expect(cards.nth(index).locator('.badge')).toHaveCount(4);
  }

  await page.goto('/blog/hashset_internals');
  await expect(page.locator('.blog-post-tags .badge')).toHaveCount(4);
});

test('section spacing, contact layout, and accent use follow the design rules', async ({
  page,
}) => {
  const style = await page.evaluate(() => {
    const contact = document.querySelector<HTMLElement>('.contact-band-inner')!;
    const eyebrow = document.querySelector<HTMLElement>('.hero-welcome')!;
    const divider = document.querySelector<HTMLElement>('.section-heading h2')!;
    const primaryButton = document.querySelector<HTMLElement>('.btn-primary')!;
    const activeLink = document.querySelector<HTMLElement>('.nav-link.active')!;
    const textColor = (element: HTMLElement) => getComputedStyle(element).color;
    return {
      contactColumns:
        getComputedStyle(contact).gridTemplateColumns.split(' ').length,
      viewportWidth: innerWidth,
      contactGap: parseFloat(getComputedStyle(contact).columnGap),
      eyebrowColor: textColor(eyebrow),
      dividerWidth: getComputedStyle(divider, '::after').width,
      buttonColor: getComputedStyle(primaryButton).backgroundColor,
      activeLinkColor: textColor(activeLink),
    };
  });

  expect(style.contactColumns).toBe(style.viewportWidth <= 900 ? 1 : 2);
  expect(style.contactGap).toBeGreaterThanOrEqual(20);
  expect(style.eyebrowColor).not.toBe('rgb(0, 102, 204)');
  expect(style.dividerWidth).toBe('32px');
  expect(style.buttonColor).toBe('rgb(0, 102, 204)');
  expect(style.activeLinkColor).toBe('rgb(0, 102, 204)');
});

test('all homepage sections and key components have usable spacing and fit the viewport', async ({
  page,
}) => {
  const layout = await page.evaluate(() => {
    const selectors = [
      '.navbar',
      '.container',
      '.scan-hero-grid',
      '.scan-hero-copy',
      '.quick-profile-panel',
      '.scan-section',
      '.section-heading',
      '.positioning-card',
      '.experience-snapshot',
      '.skill-cluster',
      '.education-scan-card',
      '.contact-band-inner',
      '.btn',
    ];
    const measurements = selectors.flatMap((selector) =>
      [...document.querySelectorAll<HTMLElement>(selector)]
        .filter((element) => element.getBoundingClientRect().width > 0)
        .map((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            selector,
            width: rect.width,
            height: rect.height,
            padding: [
              style.paddingTop,
              style.paddingRight,
              style.paddingBottom,
              style.paddingLeft,
            ],
            gap: style.gap,
            fontSize: style.fontSize,
          };
        }),
    );
    const sections = [
      ...document.querySelectorAll<HTMLElement>('.scan-hero, .scan-section'),
    ].map((section) => {
      const style = getComputedStyle(section);
      const rect = section.getBoundingClientRect();
      return {
        id: section.id,
        paddingTop: parseFloat(style.paddingTop),
        paddingBottom: parseFloat(style.paddingBottom),
        left: rect.left,
        right: rect.right,
      };
    });
    return {
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
      measurements,
      sections,
    };
  });

  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.sections.map((section) => section.id)).toEqual([
    'snapshot',
    'fit',
    'experience',
    'skills',
    'education',
    'contact',
  ]);
  for (const section of layout.sections) {
    expect(
      section.paddingTop,
      `${section.id} top padding`,
    ).toBeGreaterThanOrEqual(40);
    expect(
      section.paddingBottom,
      `${section.id} bottom padding`,
    ).toBeGreaterThanOrEqual(40);
    expect(section.left).toBeGreaterThanOrEqual(0);
    expect(section.right).toBeLessThanOrEqual(layout.viewportWidth);
  }
  expect(layout.measurements.length).toBeGreaterThan(25);
  for (const element of layout.measurements) {
    expect(element.width, `${element.selector} width`).toBeGreaterThan(0);
    expect(element.height, `${element.selector} height`).toBeGreaterThan(0);
    expect(
      parseFloat(element.fontSize),
      `${element.selector} font size`,
    ).toBeGreaterThan(0);
  }
});
