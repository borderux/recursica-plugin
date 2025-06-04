type SvgMetadata = {
  [key: string]: string;
};

async function collectIconsFromNodes(node: BaseNode, svgIcons: SvgMetadata): Promise<void> {
  if (node.type === 'VECTOR') {
    if (node.parent?.type === 'COMPONENT' && node.parent.parent?.type === 'COMPONENT_SET') {
      const svg = await node.parent.exportAsync({ format: 'SVG' });
      const svgString = String.fromCharCode.apply(null, Array.from(svg));

      const svgName = `${node.parent.parent.name}[${node.parent.name}]`;
      if (!svgIcons[svgName]) svgIcons[svgName] = svgString;
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      await collectIconsFromNodes(child, svgIcons);
    }
  }
}

async function getSvgIconsFromNodes(nodes: SceneNode[]): Promise<SvgMetadata> {
  const svgIcons: SvgMetadata = {};

  for (const node of nodes) {
    await collectIconsFromNodes(node, svgIcons);
  }

  return svgIcons;
}

export async function exportIcons() {
  const svgIcons: SvgMetadata = {};
  await collectIconsFromNodes(figma.currentPage, svgIcons);

  figma.ui.postMessage({ type: 'EXPORT_SVG_ICONS', payload: svgIcons });
  return svgIcons;
}

export async function exportSelectedIcons(currentSelection: SceneNode[]) {
  const selectedIcons = await getSvgIconsFromNodes(currentSelection);

  figma.ui.postMessage({ type: 'EXPORT_SELECTED_ICONS', payload: selectedIcons });
}
