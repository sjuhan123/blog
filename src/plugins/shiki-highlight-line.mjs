const MARKER = /^\/\/\s*highlight-line\s*$/;

function textOf(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

function addClass(node, className) {
  node.properties ||= {};
  const existing = node.properties.class;
  const classes = Array.isArray(existing) ? existing : typeof existing === 'string' ? existing.split(/\s+/).filter(Boolean) : [];
  if (!classes.includes(className)) classes.push(className);
  node.properties.class = classes;
}

/**
 * 코드 블록 안에서 줄 끝에 `// highlight-line` 주석이 달린 줄을 찾아
 * 하이라이트 표시를 하고, 주석 자체는 렌더링 결과에서 지운다.
 * Shiki의 line transformer 훅은 이미 토큰화된 <span class="line"> 요소를
 * 받기 때문에, 그 자식 중 주석 토큰을 찾아서 처리한다.
 */
export function shikiHighlightLine() {
  return {
    name: 'highlight-line',
    line(node) {
      const markerIndex = node.children.findIndex((child) => MARKER.test(textOf(child).trim()));
      if (markerIndex === -1) return;

      addClass(node, 'highlighted');
      node.children.splice(markerIndex, 1);

      const prev = node.children[markerIndex - 1];
      if (prev?.type === 'text' && /^\s+$/.test(prev.value)) {
        node.children.splice(markerIndex - 1, 1);
      }
    },
  };
}
