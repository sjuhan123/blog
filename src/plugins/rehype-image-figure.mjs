import { visit } from 'unist-util-visit';

/**
 * `![alt](src)` 단독으로만 있는 문단(이미지 하나만 들어있는 <p>)을 <figure>로
 * 감싸고, alt 텍스트를 화면에 보이는 <figcaption>으로 만들어준다.
 * 글 쓸 때는 평소처럼 마크다운 이미지 문법만 쓰면, 크기 제한과 캡션이 자동으로 붙는다.
 */
export default function rehypeImageFigure() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined || node.tagName !== 'p') return;
      if (node.children.length !== 1) return;

      const [child] = node.children;
      if (child.type !== 'element' || child.tagName !== 'img') return;

      const alt = child.properties?.alt;
      const figureChildren = [child];

      if (alt) {
        figureChildren.push({
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: alt }],
        });
      }

      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: figureChildren,
      };
    });
  };
}
