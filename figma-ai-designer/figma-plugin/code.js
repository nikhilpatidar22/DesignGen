
const POLL_INTERVAL = 1000;
const BACKEND_URL = "http://127.0.0.1:4000/mcp/figma/next";

// Convert hex color (#RRGGBB) to RGB object for Figma
function hexToRgb(hex) {
  if (!hex) return { r: 1, g: 1, b: 1 };
  hex = hex.replace(/^#/, "");
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

async function updateNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (!node) {
      console.warn("updateNode: node not found", cmd.id);
      return;
    }
    const props = cmd.props || {};
    for (const [k, v] of Object.entries(props)) {
      try {
        if (k === "color" || k === "background") {
          const color = hexToRgb(v);
          node.fills = [{ type: "SOLID", color }];
        } else if (k === "text" && node.type === "TEXT") {
          await figma.loadFontAsync(node.fontName || { family: "Inter", style: "Regular" });
          node.characters = v;
        } else if (k === "fontSize" && node.type === "TEXT") {
          node.fontSize = v;
        } else if (k in node) {
          node[k] = v;
        }
      } catch (err) {
        console.warn("updateNode prop error", k, err);
      }
    }
  } catch (err) {
    console.error("updateNode failure", err);
  }
}

async function moveNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (!node) return;
    if (cmd.x !== undefined) node.x = cmd.x;
    if (cmd.y !== undefined) node.y = cmd.y;
  } catch (err) {
    console.error("moveNode failure", err);
  }
}

async function deleteNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (node) node.remove();
  } catch (err) {
    console.error("deleteNode failure", err);
  }
}

// Create a single node from JSON element (Recursive)
async function createNode(el, parent = figma.currentPage) {
  let node = null;

  // 1. Create the base node based on type
  switch (el.type) {
    case "frame":
      node = figma.createFrame();
      break;
    case "rectangle":
      node = figma.createRectangle();
      break;
    case "circle":
    case "ellipse":
      node = figma.createEllipse();
      break;
    case "text":
      node = figma.createText();
      await figma.loadFontAsync({ family: el.fontFamily || "Inter", style: "Regular" });
      node.characters = el.text || "Text";
      node.fontSize = el.fontSize || 16;
      if (el.textAlign) {
        node.textAlignHorizontal = el.textAlign === "CENTER" ? "CENTER" : el.textAlign === "RIGHT" ? "RIGHT" : "LEFT";
      }
      if (el.color) {
        node.fills = [{ type: "SOLID", color: hexToRgb(el.color) }];
      }
      break;
    case "image":
      node = figma.createRectangle(); // Placeholder for image
      if (el.url) {
        // In a real plugin, you'd fetch the image bytes here.
        // For now, we'll just name it "Image: [url]"
        node.name = `Image: ${el.url}`;
        node.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
      }
      break;
    default:
      // Default to frame if unknown
      node = figma.createFrame();
      break;
  }

  // 2. Apply common properties
  if (el.name) node.name = el.name;

  // Size (if not auto-layout parent)
  if (el.width && el.height) {
    node.resize(el.width, el.height);
  }

  // Position (if absolute)
  if (typeof el.x === 'number') node.x = el.x;
  if (typeof el.y === 'number') node.y = el.y;

  // Fills (Background)
  if (el.background || (el.color && el.type !== "text")) {
    const color = hexToRgb(el.background || el.color);
    node.fills = [{ type: "SOLID", color }];
  }

  // Corner Radius
  if (el.cornerRadius && "cornerRadius" in node) {
    node.cornerRadius = el.cornerRadius;
  }

  // Strokes / Borders
  if (el.stroke) {
    node.strokes = [{ type: "SOLID", color: hexToRgb(el.stroke) }];
    if (el.strokeWeight) node.strokeWeight = el.strokeWeight;
  }

  // 3. Auto Layout Properties (The Magic)
  if (el.layoutMode && "layoutMode" in node) {
    node.layoutMode = el.layoutMode; // "HORIZONTAL" or "VERTICAL"

    if (el.itemSpacing) node.itemSpacing = el.itemSpacing;
    if (el.padding) {
      node.paddingLeft = el.padding;
      node.paddingRight = el.padding;
      node.paddingTop = el.padding;
      node.paddingBottom = el.padding;
    }
    // Granular padding
    if (el.paddingHorizontal) {
      node.paddingLeft = el.paddingHorizontal;
      node.paddingRight = el.paddingHorizontal;
    }
    if (el.paddingVertical) {
      node.paddingTop = el.paddingVertical;
      node.paddingBottom = el.paddingVertical;
    }

    // Alignment
    if (el.primaryAxisAlignItems) node.primaryAxisAlignItems = el.primaryAxisAlignItems; // MIN, MAX, CENTER, SPACE_BETWEEN
    if (el.counterAxisAlignItems) node.counterAxisAlignItems = el.counterAxisAlignItems; // MIN, MAX, CENTER

    // Sizing Mode (HUG vs FIXED vs FILL)
    if (el.primaryAxisSizingMode) node.primaryAxisSizingMode = el.primaryAxisSizingMode; // "FIXED" or "AUTO" (Hug)
    if (el.counterAxisSizingMode) node.counterAxisSizingMode = el.counterAxisSizingMode; // "FIXED" or "AUTO" (Hug)

    // "Fill Container" is handled by setting layoutGrow = 1 on the CHILD, not the parent.
  }

  // 4. Layout Grow/Align (for children of auto-layout)
  if (el.layoutGrow !== undefined && "layoutGrow" in node) node.layoutGrow = el.layoutGrow; // 1 = Fill container
  if (el.layoutAlign !== undefined && "layoutAlign" in node) node.layoutAlign = el.layoutAlign; // "STRETCH"

  // 5. Add to parent
  parent.appendChild(node);

  // 6. Recursively create children
  if (el.children && Array.isArray(el.children)) {
    for (const child of el.children) {
      await createNode(child, node);
    }
  }

  return node;
}

async function pollBackend() {
  try {
    const res = await fetch(BACKEND_URL);
    if (!res.ok) return;

    const payload = await res.json();
    let commands = [];

    if (Array.isArray(payload)) {
      commands = payload;
    } else if (payload && payload.status === "no-command") {
      return;
    } else if (payload) {
      commands = [payload];
    }

    for (const cmd of commands) {
      const action = (cmd.action || "create").toLowerCase();
      if (action === "create") {
        await createNode(cmd);
      } else if (action === "update") {
        await updateNode(cmd);
      } else if (action === "move") {
        await moveNode(cmd);
      } else if (action === "delete") {
        await deleteNode(cmd);
      }
    }
  } catch (e) {
    console.error("Error polling backend:", e);
  } finally {
    setTimeout(pollBackend, POLL_INTERVAL);
  }
}

pollBackend();
figma.notify("MCP Figma plugin running (Auto-Layout Enabled)...");