import type { ThemeRegistration } from 'shiki';

const token = (name: string) => `var(--code-${name})`;

/**
 * Shiki theme whose colours are the site's --code-* custom properties, so
 * highlighted code follows the light/dark switch without re-rendering.
 * Shiki's generic CSS-variables theme files Java class names under
 * storage.type (keyword colour); this one gives types their own token.
 */
export const codeTheme: ThemeRegistration = {
  name: 'site',
  type: 'light',
  fg: token('fg'),
  bg: 'transparent',
  colors: {
    'editor.foreground': token('fg'),
    'editor.background': 'transparent',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: token('comment'), fontStyle: 'italic' },
    },
    {
      scope: [
        'punctuation',
        'keyword.operator',
        'meta.brace',
        'meta.delimiter',
      ],
      settings: { foreground: token('punct') },
    },
    {
      scope: [
        'storage.type',
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
        'support.class',
        'support.type',
      ],
      settings: { foreground: token('type') },
    },
    {
      scope: [
        'keyword',
        'keyword.operator.new',
        'keyword.operator.instanceof',
        'storage.modifier',
        'storage.type.primitive',
        'storage.type.function',
        'storage.type.class',
        'storage.type.interface',
        'storage.type.enum',
        'storage.type.record',
        'constant.language',
        'variable.language',
      ],
      settings: { foreground: token('keyword'), fontStyle: 'bold' },
    },
    {
      scope: [
        'storage.type.annotation',
        'punctuation.definition.annotation',
        'meta.declaration.annotation',
        'entity.name.function.decorator',
        'meta.decorator',
      ],
      settings: { foreground: token('annotation') },
    },
    {
      // import java.util.HashSet; / package com.example; — the path, not the keyword.
      scope: [
        'storage.modifier.import',
        'storage.modifier.package',
        'entity.name.package',
      ],
      settings: { foreground: token('fg'), fontStyle: '' },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'string.regexp'],
      settings: { foreground: token('string') },
    },
    {
      scope: ['constant.numeric', 'constant.character'],
      settings: { foreground: token('number') },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: token('fn') },
    },
    {
      scope: ['markup.inserted', 'punctuation.definition.inserted'],
      settings: { foreground: token('string') },
    },
    {
      scope: ['markup.deleted', 'punctuation.definition.deleted'],
      settings: { foreground: token('keyword') },
    },
    {
      scope: ['entity.name.tag', 'support.type.property-name'],
      settings: { foreground: token('keyword') },
    },
  ],
};
